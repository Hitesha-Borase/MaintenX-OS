import { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "./auth.service.js";
import { loginSchema, digitalSignOffSchema, tenantRegistrationSchema } from "./auth.schema.js";
import { formatSuccess } from "../../shared/utils/responseFormatter.js";
import { UnauthorizedError, ValidationError } from "../../shared/errors/AppError.js";
import { logAuditTrail } from "../../middleware/auditContext.js";
import { masterAdminService } from "../master/master.service.js";
import { db, tenants, subscriptions, tenantModules } from "../../db/index.js";
import { eq, desc } from "drizzle-orm";

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const input = tenantRegistrationSchema.parse(request.body || {});
    const name = (input.name || input.company || input.companyName || "").trim();
    const admin = (input.admin || input.adminName || input.ownerName || input.fullName || "").trim();
    const adminEmail = (input.adminEmail || input.email || "").trim().toLowerCase();
    const adminPhone = (input.adminPhone || input.phone || "").trim();
    const password = input.password.trim();
    const subscription = (input.subscription || input.plan || "Plant Pilot").trim();

    const company = await masterAdminService.createCompany({
      name,
      admin,
      adminEmail,
      adminPhone,
      password,
      subscription,
    });

    const { user, tenant } = await authService.validateUserCredentials({
      email: adminEmail,
      password,
    });

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      plantId: user.plantId,
      role: user.role,
      permissions: ["*"],
      isMasterAdmin: user.isMasterAdmin,
    });

    await logAuditTrail({
      tenantId: user.tenantId,
      plantId: user.plantId,
      userId: user.id,
      action: "REGISTER",
      entityType: "Tenant",
      entityId: user.tenantId,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(201).send(
      formatSuccess(
        {
          token,
          user,
          tenant: tenant || null,
          company,
        },
        "Tenant registered successfully"
      )
    );
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body);
    const { user, tenant } = await authService.validateUserCredentials(input);

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      plantId: user.plantId,
      role: user.role,
      permissions: (user as any).permissions || (user.isMasterAdmin || user.role === "admin" || user.role === "master_admin" ? ["*"] : []),
      isMasterAdmin: user.isMasterAdmin,
    });

    await logAuditTrail({
      tenantId: user.tenantId,
      plantId: user.plantId,
      userId: user.id,
      action: "LOGIN",
      entityType: "UserSession",
      entityId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.send(
      formatSuccess({
        token,
        user,
        tenant: tenant || null,
      }, "Logged in successfully")
    );
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    let tenantData = null;
    if (user?.tenantId) {
      try {
        const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
        if (tenant) {
          const [sub] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.tenantId, tenant.id))
            .orderBy(desc(subscriptions.createdAt))
            .limit(1);

          const activePlan = sub?.planName || tenant.plan || "Plant Pilot";
          const planKey = activePlan.toLowerCase().trim();

          const CANONICAL_PLAN_MODULES: Record<string, string[]> = {
            "plant pilot": ["produce"],
            "pilot": ["produce"],
            "trial": ["produce"],
            "starter": ["produce", "verify"],
            "individual modules": ["produce", "verify"],
            "bundles": ["plan", "produce", "verify", "maintain", "move"],
            "advanced": ["plan", "produce", "verify", "maintain", "move"],
            "maintenx os complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "enterprise": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
          };

          const allowed = CANONICAL_PLAN_MODULES[planKey] || (
            activePlan.toUpperCase() === "ENTERPRISE" || planKey.includes("complete")
              ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"]
              : planKey.includes("bundle")
              ? ["plan", "produce", "verify", "maintain", "move"]
              : ["produce"]
          );

          const modulesMap: Record<string, boolean> = {
            plan: allowed.includes("plan"),
            produce: allowed.includes("produce"),
            verify: allowed.includes("verify"),
            maintain: allowed.includes("maintain"),
            move: allowed.includes("move"),
            people: allowed.includes("people"),
            improve: allowed.includes("improve"),
            intelligence: allowed.includes("intelligence"),
          };

          try {
            const explicitMods = await db.select().from(tenantModules).where(eq(tenantModules.tenantId, tenant.id));
            for (const m of explicitMods) {
              modulesMap[m.moduleKey] = m.isEnabled;
            }
          } catch (e: any) {
            // ignore
          }

          tenantData = {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            plan: activePlan,
            createdAt: tenant.createdAt,
            hasSubscription: Boolean(sub && sub.status === "ACTIVE" && new Date(sub.currentPeriodEnd) > new Date()),
            subscriptionExpiryDate: sub?.currentPeriodEnd || null,
            subscriptionStatus: sub?.status || "TRIAL",
            subscription: sub || null,
            modules: modulesMap,
          };
        }
      } catch (e: any) {
        console.warn("Could not fetch tenant in /auth/me:", e.message);
      }
    }

    return reply.send(
      formatSuccess({
        user: request.user,
        tenant: tenantData,
      })
    );
  }

  async digitalSignOff(request: FastifyRequest, reply: FastifyReply) {
    const input = digitalSignOffSchema.parse(request.body);
    const user = request.user;

    const isValid = await authService.verifyDigitalSignaturePin(user.userId, input.pin);
    if (!isValid) {
      throw new UnauthorizedError("Invalid 21 CFR Part 11 Digital Signature PIN");
    }

    await logAuditTrail({
      tenantId: user.tenantId,
      plantId: user.plantId,
      userId: user.userId,
      action: "DIGITAL_SIGNATURE",
      entityType: input.entityType,
      entityId: input.entityId,
      newValues: { meaning: input.meaning, comments: input.comments },
      ipAddress: request.ip,
    });

    return reply.send(
      formatSuccess({
        signed: true,
        signedAt: new Date().toISOString(),
        signedBy: user.email,
      }, "Electronic signature verified and recorded (21 CFR Part 11)")
    );
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    return reply.send(formatSuccess(null, "Logged out cleanly"));
  }
}

export const authController = new AuthController();
