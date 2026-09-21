import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { db } from "../../config/database.js";
import { notifications } from "../../db/schema/common.js";
import { workOrders, pmSchedules } from "../../db/schema/maintenance.js";
import { productionOrders } from "../../db/schema/production.js";
import { qualityHolds, deviations, ccpChecks } from "../../db/schema/quality.js";
import { customerOrders } from "../../db/schema/planning.js";
import { eq, desc, and, inArray, gte } from "drizzle-orm";
import { formatSuccess } from "../../shared/utils/responseFormatter.js";
import { authenticate } from "../../middleware/authenticate.js";
import { isValidUuid } from "../../shared/utils/tenantContext.js";

// -------------------------------------------------------------------
// Sync real events from all domain tables into the notifications table.
// Uses title+linkUrl dedup so we never create duplicates on re-fetch.
// -------------------------------------------------------------------
async function syncCrossModuleNotifications(tenantId: string): Promise<void> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const toInsert: Array<typeof notifications.$inferInsert> = [];

  // ── MAINTENANCE: Open/Assigned Work Orders ──────────────────────
  try {
    const openWOs = await db.select().from(workOrders)
      .where(and(eq(workOrders.tenantId, tenantId), inArray(workOrders.status, ["OPEN", "ASSIGNED", "EMERGENCY_BREAKDOWN"])))
      .orderBy(desc(workOrders.createdAt)).limit(20);
    for (const wo of openWOs) {
      const severity = (wo.priority === "P1_CRITICAL" || wo.type === "EMERGENCY_BREAKDOWN") ? "CRITICAL" : wo.priority === "HIGH" ? "WARNING" : "INFO";
      toInsert.push({ tenantId, title: `Work Order ${wo.woNumber} — ${wo.type === "EMERGENCY_BREAKDOWN" ? "Emergency Breakdown" : wo.status}`, message: wo.title, category: "MAINTENANCE", severity, targetRole: "MAINTENANCE", isRead: false, linkUrl: `/maintenance/work-orders`, createdAt: wo.createdAt });
    }
  } catch { /* table may not exist */ }

  // ── MAINTENANCE: Overdue PM Schedules ───────────────────────────
  try {
    const overduePMs = await db.select().from(pmSchedules)
      .where(and(eq(pmSchedules.tenantId, tenantId), eq(pmSchedules.status, "OVERDUE"))).limit(10);
    for (const pm of overduePMs) {
      toInsert.push({ tenantId, title: `PM Overdue — ${pm.scheduleCode}`, message: `${pm.title} is overdue (${pm.frequency}). Immediate action required.`, category: "MAINTENANCE", severity: "WARNING", targetRole: "MAINTENANCE", isRead: false, linkUrl: `/maintenance/pm-schedules`, createdAt: pm.nextDueDate });
    }
  } catch { /* skip */ }

  // ── PRODUCTION: Active Production Orders ────────────────────────
  try {
    const activeOrders = await db.select().from(productionOrders)
      .where(and(eq(productionOrders.tenantId, tenantId), inArray(productionOrders.status, ["RUNNING", "QA_PENDING", "PLANNED", "RELEASED"])))
      .orderBy(desc(productionOrders.createdAt)).limit(15);
    for (const po of activeOrders) {
      const severity = po.status === "QA_PENDING" ? "WARNING" : "INFO";
      const label = po.status === "QA_PENDING" ? "Awaiting QA Release" : po.status === "RUNNING" ? "In Production" : po.status;
      toInsert.push({ tenantId, title: `Production Order ${po.orderNumber} — ${label}`, message: `Status: ${po.status} | Priority: ${po.priority || "NORMAL"} | Target Qty: ${po.targetQuantity}`, category: "PRODUCTION", severity, targetRole: "ALL", isRead: false, linkUrl: `/linelead/production-orders`, createdAt: po.createdAt });
    }
  } catch { /* skip */ }

  // ── QUALITY: Active Quality Holds ───────────────────────────────
  try {
    const activeHolds = await db.select().from(qualityHolds)
      .where(and(eq(qualityHolds.tenantId, tenantId), eq(qualityHolds.status, "ACTIVE_HOLD")))
      .orderBy(desc(qualityHolds.holdAt)).limit(10);
    for (const hold of activeHolds) {
      toInsert.push({ tenantId, title: `Quality Hold — Lot ${hold.lotNumber}`, message: `${hold.reason} | Severity: ${hold.severity || "HIGH"}`, category: "QUALITY", severity: hold.severity === "CRITICAL" ? "CRITICAL" : "WARNING", targetRole: "QUALITY", isRead: false, linkUrl: `/quality/holds`, createdAt: hold.holdAt });
    }
  } catch { /* skip */ }

  // ── QUALITY: CCP Failures (last 7 days) ─────────────────────────
  try {
    const ccpFails = await db.select().from(ccpChecks)
      .where(and(eq(ccpChecks.tenantId, tenantId), eq(ccpChecks.status, "FAIL"), gte(ccpChecks.checkedAt, sevenDaysAgo)))
      .orderBy(desc(ccpChecks.checkedAt)).limit(8);
    for (const ccp of ccpFails) {
      toInsert.push({ tenantId, title: `CCP Failure — ${ccp.ccpCode}`, message: `${ccp.ccpName} FAILED | Actual: ${ccp.actualValue} ${ccp.uom} | Limit: ${ccp.criticalLimit}`, category: "QUALITY_CCP", severity: "CRITICAL", targetRole: "QUALITY", isRead: false, linkUrl: `/quality/checks/ccp`, createdAt: ccp.checkedAt });
    }
  } catch { /* skip */ }

  // ── QUALITY: Open Deviations ────────────────────────────────────
  try {
    const openDevs = await db.select().from(deviations)
      .where(and(eq(deviations.tenantId, tenantId), inArray(deviations.status, ["UNDER_INVESTIGATION", "CAPA_INITIATED"])))
      .orderBy(desc(deviations.createdAt)).limit(8);
    for (const dev of openDevs) {
      toInsert.push({ tenantId, title: `Deviation ${dev.deviationNumber} — ${(dev.status || "").replace(/_/g, " ")}`, message: dev.title, category: "QUALITY", severity: dev.severity === "CRITICAL" ? "CRITICAL" : "WARNING", targetRole: "QUALITY", isRead: false, linkUrl: `/quality/events/investigations`, createdAt: dev.createdAt });
    }
  } catch { /* skip */ }

  // ── PLANNING: Urgent Customer Orders ────────────────────────────
  try {
    const urgentOrders = await db.select().from(customerOrders)
      .where(and(eq(customerOrders.tenantId, tenantId), inArray(customerOrders.priority, ["URGENT"]), inArray(customerOrders.status, ["CONFIRMED", "SCHEDULED"])))
      .orderBy(desc(customerOrders.createdAt)).limit(8);
    for (const co of urgentOrders) {
      toInsert.push({ tenantId, title: `Urgent Customer Order — ${co.orderNumber}`, message: `${co.customerName} | Qty: ${co.quantity} | Due: ${co.requestedDate ? new Date(co.requestedDate).toLocaleDateString() : "TBD"}`, category: "PLANNING", severity: "WARNING", targetRole: "ALL", isRead: false, linkUrl: `/planner/orders`, createdAt: co.createdAt });
    }
  } catch { /* skip */ }

  if (toInsert.length === 0) return;

  // ── Dedup: skip records whose title+linkUrl already exist ───────
  try {
    const existing = await db.select({ title: notifications.title, linkUrl: notifications.linkUrl }).from(notifications).where(eq(notifications.tenantId, tenantId));
    const existingSet = new Set(existing.map((e) => `${e.title}||${e.linkUrl}`));
    const newRecords = toInsert.filter((r) => !existingSet.has(`${r.title}||${r.linkUrl}`));
    if (newRecords.length > 0) {
      await db.insert(notifications).values(newRecords).onConflictDoNothing();
    }
  } catch { /* non-fatal */ }
}

// -------------------------------------------------------------------
// Controller
// -------------------------------------------------------------------
export class NotificationsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = isValidUuid(request.user.tenantId) ? request.user.tenantId : "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
    await syncCrossModuleNotifications(tenantId);
    const data = await db.select().from(notifications).where(eq(notifications.tenantId, tenantId)).orderBy(desc(notifications.createdAt)).limit(50);
    return reply.send(formatSuccess(data));
  }

  async markAsRead(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try { await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, request.params.id)); } catch { /* ignore */ }
    return reply.send(formatSuccess({ markedRead: true, id: request.params.id }));
  }

  async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = isValidUuid(request.user.tenantId) ? request.user.tenantId : "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
    try { await db.update(notifications).set({ isRead: true }).where(eq(notifications.tenantId, tenantId)); } catch { /* ignore */ }
    return reply.send(formatSuccess({ markedAllRead: true }));
  }

  async deleteNotification(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try { await db.delete(notifications).where(eq(notifications.id, request.params.id)); } catch { /* ignore */ }
    return reply.send(formatSuccess({ deleted: true, id: request.params.id }));
  }

  async clearAll(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = isValidUuid(request.user.tenantId) ? request.user.tenantId : "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
    try { await db.delete(notifications).where(eq(notifications.tenantId, tenantId)); } catch { /* ignore */ }
    return reply.send(formatSuccess({ clearedAll: true }));
  }
}

export const notificationsController = new NotificationsController();

export async function notificationsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);
  fastify.get("/", { schema: { tags: ["Notifications"], summary: "List Notifications (real-time cross-module sync)" } }, notificationsController.list.bind(notificationsController));
  fastify.patch("/read-all", { schema: { tags: ["Notifications"], summary: "Mark All Notifications as Read" } }, notificationsController.markAllAsRead.bind(notificationsController));
  fastify.delete("/all", { schema: { tags: ["Notifications"], summary: "Clear All Notifications" } }, notificationsController.clearAll.bind(notificationsController));
  fastify.patch("/:id/read", { schema: { tags: ["Notifications"], summary: "Mark Notification as Read" } }, notificationsController.markAsRead.bind(notificationsController));
  fastify.delete("/:id", { schema: { tags: ["Notifications"], summary: "Delete Single Notification" } }, notificationsController.deleteNotification.bind(notificationsController));
}
