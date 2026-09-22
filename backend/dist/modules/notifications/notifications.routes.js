"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = exports.NotificationsController = void 0;
exports.notificationsRoutes = notificationsRoutes;
const database_js_1 = require("../../config/database.js");
const common_js_1 = require("../../db/schema/common.js");
const maintenance_js_1 = require("../../db/schema/maintenance.js");
const production_js_1 = require("../../db/schema/production.js");
const quality_js_1 = require("../../db/schema/quality.js");
const planning_js_1 = require("../../db/schema/planning.js");
const drizzle_orm_1 = require("drizzle-orm");
const responseFormatter_js_1 = require("../../shared/utils/responseFormatter.js");
const authenticate_js_1 = require("../../middleware/authenticate.js");
const tenantContext_js_1 = require("../../shared/utils/tenantContext.js");
// -------------------------------------------------------------------
// Sync real events from all domain tables into the notifications table.
// Uses title+linkUrl dedup so we never create duplicates on re-fetch.
// -------------------------------------------------------------------
async function syncCrossModuleNotifications(tenantId) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const toInsert = [];
    // ── MAINTENANCE: Open/Assigned Work Orders ──────────────────────
    try {
        const openWOs = await database_js_1.db.select().from(maintenance_js_1.workOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(maintenance_js_1.workOrders.tenantId, tenantId), (0, drizzle_orm_1.inArray)(maintenance_js_1.workOrders.status, ["OPEN", "ASSIGNED", "EMERGENCY_BREAKDOWN"])))
            .orderBy((0, drizzle_orm_1.desc)(maintenance_js_1.workOrders.createdAt)).limit(20);
        for (const wo of openWOs) {
            const severity = (wo.priority === "P1_CRITICAL" || wo.type === "EMERGENCY_BREAKDOWN") ? "CRITICAL" : wo.priority === "HIGH" ? "WARNING" : "INFO";
            toInsert.push({ tenantId, title: `Work Order ${wo.woNumber} — ${wo.type === "EMERGENCY_BREAKDOWN" ? "Emergency Breakdown" : wo.status}`, message: wo.title, category: "MAINTENANCE", severity, targetRole: "MAINTENANCE", isRead: false, linkUrl: `/maintenance/work-orders`, createdAt: wo.createdAt });
        }
    }
    catch { /* table may not exist */ }
    // ── MAINTENANCE: Overdue PM Schedules ───────────────────────────
    try {
        const overduePMs = await database_js_1.db.select().from(maintenance_js_1.pmSchedules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(maintenance_js_1.pmSchedules.tenantId, tenantId), (0, drizzle_orm_1.eq)(maintenance_js_1.pmSchedules.status, "OVERDUE"))).limit(10);
        for (const pm of overduePMs) {
            toInsert.push({ tenantId, title: `PM Overdue — ${pm.scheduleCode}`, message: `${pm.title} is overdue (${pm.frequency}). Immediate action required.`, category: "MAINTENANCE", severity: "WARNING", targetRole: "MAINTENANCE", isRead: false, linkUrl: `/maintenance/pm-schedules`, createdAt: pm.nextDueDate });
        }
    }
    catch { /* skip */ }
    // ── PRODUCTION: Active Production Orders ────────────────────────
    try {
        const activeOrders = await database_js_1.db.select().from(production_js_1.productionOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(production_js_1.productionOrders.tenantId, tenantId), (0, drizzle_orm_1.inArray)(production_js_1.productionOrders.status, ["RUNNING", "QA_PENDING", "PLANNED", "RELEASED"])))
            .orderBy((0, drizzle_orm_1.desc)(production_js_1.productionOrders.createdAt)).limit(15);
        for (const po of activeOrders) {
            const severity = po.status === "QA_PENDING" ? "WARNING" : "INFO";
            const label = po.status === "QA_PENDING" ? "Awaiting QA Release" : po.status === "RUNNING" ? "In Production" : po.status;
            toInsert.push({ tenantId, title: `Production Order ${po.orderNumber} — ${label}`, message: `Status: ${po.status} | Priority: ${po.priority || "NORMAL"} | Target Qty: ${po.targetQuantity}`, category: "PRODUCTION", severity, targetRole: "ALL", isRead: false, linkUrl: `/linelead/production-orders`, createdAt: po.createdAt });
        }
    }
    catch { /* skip */ }
    // ── QUALITY: Active Quality Holds ───────────────────────────────
    try {
        const activeHolds = await database_js_1.db.select().from(quality_js_1.qualityHolds)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(quality_js_1.qualityHolds.tenantId, tenantId), (0, drizzle_orm_1.eq)(quality_js_1.qualityHolds.status, "ACTIVE_HOLD")))
            .orderBy((0, drizzle_orm_1.desc)(quality_js_1.qualityHolds.holdAt)).limit(10);
        for (const hold of activeHolds) {
            toInsert.push({ tenantId, title: `Quality Hold — Lot ${hold.lotNumber}`, message: `${hold.reason} | Severity: ${hold.severity || "HIGH"}`, category: "QUALITY", severity: hold.severity === "CRITICAL" ? "CRITICAL" : "WARNING", targetRole: "QUALITY", isRead: false, linkUrl: `/quality/holds`, createdAt: hold.holdAt });
        }
    }
    catch { /* skip */ }
    // ── QUALITY: CCP Failures (last 7 days) ─────────────────────────
    try {
        const ccpFails = await database_js_1.db.select().from(quality_js_1.ccpChecks)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(quality_js_1.ccpChecks.tenantId, tenantId), (0, drizzle_orm_1.eq)(quality_js_1.ccpChecks.status, "FAIL"), (0, drizzle_orm_1.gte)(quality_js_1.ccpChecks.checkedAt, sevenDaysAgo)))
            .orderBy((0, drizzle_orm_1.desc)(quality_js_1.ccpChecks.checkedAt)).limit(8);
        for (const ccp of ccpFails) {
            toInsert.push({ tenantId, title: `CCP Failure — ${ccp.ccpCode}`, message: `${ccp.ccpName} FAILED | Actual: ${ccp.actualValue} ${ccp.uom} | Limit: ${ccp.criticalLimit}`, category: "QUALITY_CCP", severity: "CRITICAL", targetRole: "QUALITY", isRead: false, linkUrl: `/quality/checks/ccp`, createdAt: ccp.checkedAt });
        }
    }
    catch { /* skip */ }
    // ── QUALITY: Open Deviations ────────────────────────────────────
    try {
        const openDevs = await database_js_1.db.select().from(quality_js_1.deviations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(quality_js_1.deviations.tenantId, tenantId), (0, drizzle_orm_1.inArray)(quality_js_1.deviations.status, ["UNDER_INVESTIGATION", "CAPA_INITIATED"])))
            .orderBy((0, drizzle_orm_1.desc)(quality_js_1.deviations.createdAt)).limit(8);
        for (const dev of openDevs) {
            toInsert.push({ tenantId, title: `Deviation ${dev.deviationNumber} — ${(dev.status || "").replace(/_/g, " ")}`, message: dev.title, category: "QUALITY", severity: dev.severity === "CRITICAL" ? "CRITICAL" : "WARNING", targetRole: "QUALITY", isRead: false, linkUrl: `/quality/events/investigations`, createdAt: dev.createdAt });
        }
    }
    catch { /* skip */ }
    // ── PLANNING: Urgent Customer Orders ────────────────────────────
    try {
        const urgentOrders = await database_js_1.db.select().from(planning_js_1.customerOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(planning_js_1.customerOrders.tenantId, tenantId), (0, drizzle_orm_1.inArray)(planning_js_1.customerOrders.priority, ["URGENT"]), (0, drizzle_orm_1.inArray)(planning_js_1.customerOrders.status, ["CONFIRMED", "SCHEDULED"])))
            .orderBy((0, drizzle_orm_1.desc)(planning_js_1.customerOrders.createdAt)).limit(8);
        for (const co of urgentOrders) {
            toInsert.push({ tenantId, title: `Urgent Customer Order — ${co.orderNumber}`, message: `${co.customerName} | Qty: ${co.quantity} | Due: ${co.requestedDate ? new Date(co.requestedDate).toLocaleDateString() : "TBD"}`, category: "PLANNING", severity: "WARNING", targetRole: "ALL", isRead: false, linkUrl: `/planner/orders`, createdAt: co.createdAt });
        }
    }
    catch { /* skip */ }
    if (toInsert.length === 0)
        return;
    // ── Dedup: skip records whose title+linkUrl already exist ───────
    try {
        const existing = await database_js_1.db.select({ title: common_js_1.notifications.title, linkUrl: common_js_1.notifications.linkUrl }).from(common_js_1.notifications).where((0, drizzle_orm_1.eq)(common_js_1.notifications.tenantId, tenantId));
        const existingSet = new Set(existing.map((e) => `${e.title}||${e.linkUrl}`));
        const newRecords = toInsert.filter((r) => !existingSet.has(`${r.title}||${r.linkUrl}`));
        if (newRecords.length > 0) {
            await database_js_1.db.insert(common_js_1.notifications).values(newRecords).onConflictDoNothing();
        }
    }
    catch { /* non-fatal */ }
}
// -------------------------------------------------------------------
// Controller
// -------------------------------------------------------------------
class NotificationsController {
    async list(request, reply) {
        const tenantId = (0, tenantContext_js_1.isValidUuid)(request.user.tenantId) ? request.user.tenantId : "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
        await syncCrossModuleNotifications(tenantId);
        const data = await database_js_1.db.select().from(common_js_1.notifications).where((0, drizzle_orm_1.eq)(common_js_1.notifications.tenantId, tenantId)).orderBy((0, drizzle_orm_1.desc)(common_js_1.notifications.createdAt)).limit(50);
        return reply.send((0, responseFormatter_js_1.formatSuccess)(data));
    }
    async markAsRead(request, reply) {
        try {
            await database_js_1.db.update(common_js_1.notifications).set({ isRead: true }).where((0, drizzle_orm_1.eq)(common_js_1.notifications.id, request.params.id));
        }
        catch { /* ignore */ }
        return reply.send((0, responseFormatter_js_1.formatSuccess)({ markedRead: true, id: request.params.id }));
    }
    async markAllAsRead(request, reply) {
        const tenantId = (0, tenantContext_js_1.isValidUuid)(request.user.tenantId) ? request.user.tenantId : "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
        try {
            await database_js_1.db.update(common_js_1.notifications).set({ isRead: true }).where((0, drizzle_orm_1.eq)(common_js_1.notifications.tenantId, tenantId));
        }
        catch { /* ignore */ }
        return reply.send((0, responseFormatter_js_1.formatSuccess)({ markedAllRead: true }));
    }
    async deleteNotification(request, reply) {
        try {
            await database_js_1.db.delete(common_js_1.notifications).where((0, drizzle_orm_1.eq)(common_js_1.notifications.id, request.params.id));
        }
        catch { /* ignore */ }
        return reply.send((0, responseFormatter_js_1.formatSuccess)({ deleted: true, id: request.params.id }));
    }
    async clearAll(request, reply) {
        const tenantId = (0, tenantContext_js_1.isValidUuid)(request.user.tenantId) ? request.user.tenantId : "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
        try {
            await database_js_1.db.delete(common_js_1.notifications).where((0, drizzle_orm_1.eq)(common_js_1.notifications.tenantId, tenantId));
        }
        catch { /* ignore */ }
        return reply.send((0, responseFormatter_js_1.formatSuccess)({ clearedAll: true }));
    }
}
exports.NotificationsController = NotificationsController;
exports.notificationsController = new NotificationsController();
async function notificationsRoutes(fastify) {
    fastify.addHook("preHandler", authenticate_js_1.authenticate);
    fastify.get("/", { schema: { tags: ["Notifications"], summary: "List Notifications (real-time cross-module sync)" } }, exports.notificationsController.list.bind(exports.notificationsController));
    fastify.patch("/read-all", { schema: { tags: ["Notifications"], summary: "Mark All Notifications as Read" } }, exports.notificationsController.markAllAsRead.bind(exports.notificationsController));
    fastify.delete("/all", { schema: { tags: ["Notifications"], summary: "Clear All Notifications" } }, exports.notificationsController.clearAll.bind(exports.notificationsController));
    fastify.patch("/:id/read", { schema: { tags: ["Notifications"], summary: "Mark Notification as Read" } }, exports.notificationsController.markAsRead.bind(exports.notificationsController));
    fastify.delete("/:id", { schema: { tags: ["Notifications"], summary: "Delete Single Notification" } }, exports.notificationsController.deleteNotification.bind(exports.notificationsController));
}
