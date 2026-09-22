"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const auth_schema_js_1 = require("./auth.schema.js");
const responseFormatter_js_1 = require("../../shared/utils/responseFormatter.js");
const AppError_js_1 = require("../../shared/errors/AppError.js");
const auditContext_js_1 = require("../../middleware/auditContext.js");
const master_service_js_1 = require("../master/master.service.js");
const index_js_1 = require("../../db/index.js");
const drizzle_orm_1 = require("drizzle-orm");
class AuthController {
    async register(request, reply) {
        const input = auth_schema_js_1.tenantRegistrationSchema.parse(request.body || {});
        const name = (input.name || input.company || input.companyName || "").trim();
        const admin = (input.admin || input.adminName || input.ownerName || input.fullName || "").trim();
        const adminEmail = (input.adminEmail || input.email || "").trim().toLowerCase();
        const adminPhone = (input.adminPhone || input.phone || "").trim();
        const password = input.password.trim();
        const subscription = (input.subscription || input.plan || "Plant Pilot").trim();
        const company = await master_service_js_1.masterAdminService.createCompany({
            name,
            admin,
            adminEmail,
            adminPhone,
            password,
            subscription,
        });
        const { user, tenant } = await auth_service_js_1.authService.validateUserCredentials({
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
        await (0, auditContext_js_1.logAuditTrail)({
            tenantId: user.tenantId,
            plantId: user.plantId,
            userId: user.id,
            action: "REGISTER",
            entityType: "Tenant",
            entityId: user.tenantId,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"],
        });
        return reply.status(201).send((0, responseFormatter_js_1.formatSuccess)({
            token,
            user,
            tenant: tenant || null,
            company,
        }, "Tenant registered successfully"));
    }
    async login(request, reply) {
        const input = auth_schema_js_1.loginSchema.parse(request.body);
        const { user, tenant } = await auth_service_js_1.authService.validateUserCredentials(input);
        const token = await reply.jwtSign({
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            plantId: user.plantId,
            role: user.role,
            permissions: user.permissions || (user.isMasterAdmin || user.role === "admin" || user.role === "master_admin" ? ["*"] : []),
            isMasterAdmin: user.isMasterAdmin,
        });
        await (0, auditContext_js_1.logAuditTrail)({
            tenantId: user.tenantId,
            plantId: user.plantId,
            userId: user.id,
            action: "LOGIN",
            entityType: "UserSession",
            entityId: user.id,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"],
        });
        return reply.send((0, responseFormatter_js_1.formatSuccess)({
            token,
            user,
            tenant: tenant || null,
        }, "Logged in successfully"));
    }
    async me(request, reply) {
        const user = request.user;
        let tenantData = null;
        if (user?.tenantId) {
            try {
                const [tenant] = await index_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, user.tenantId)).limit(1);
                if (tenant) {
                    const [sub] = await index_js_1.db
                        .select()
                        .from(index_js_1.subscriptions)
                        .where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.tenantId, tenant.id))
                        .orderBy((0, drizzle_orm_1.desc)(index_js_1.subscriptions.createdAt))
                        .limit(1);
                    const activePlan = sub?.planName || tenant.plan || "Plant Pilot";
                    const planKey = activePlan.toLowerCase().trim();
                    const CANONICAL_PLAN_MODULES = {
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
                    const allowed = CANONICAL_PLAN_MODULES[planKey] || (activePlan.toUpperCase() === "ENTERPRISE" || planKey.includes("complete")
                        ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"]
                        : planKey.includes("bundle")
                            ? ["plan", "produce", "verify", "maintain", "move"]
                            : ["produce"]);
                    const modulesMap = {
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
                        const explicitMods = await index_js_1.db.select().from(index_js_1.tenantModules).where((0, drizzle_orm_1.eq)(index_js_1.tenantModules.tenantId, tenant.id));
                        for (const m of explicitMods) {
                            modulesMap[m.moduleKey] = m.isEnabled;
                        }
                    }
                    catch (e) {
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
            }
            catch (e) {
                console.warn("Could not fetch tenant in /auth/me:", e.message);
            }
        }
        return reply.send((0, responseFormatter_js_1.formatSuccess)({
            user: request.user,
            tenant: tenantData,
        }));
    }
    async digitalSignOff(request, reply) {
        const input = auth_schema_js_1.digitalSignOffSchema.parse(request.body);
        const user = request.user;
        const isValid = await auth_service_js_1.authService.verifyDigitalSignaturePin(user.userId, input.pin);
        if (!isValid) {
            throw new AppError_js_1.UnauthorizedError("Invalid 21 CFR Part 11 Digital Signature PIN");
        }
        await (0, auditContext_js_1.logAuditTrail)({
            tenantId: user.tenantId,
            plantId: user.plantId,
            userId: user.userId,
            action: "DIGITAL_SIGNATURE",
            entityType: input.entityType,
            entityId: input.entityId,
            newValues: { meaning: input.meaning, comments: input.comments },
            ipAddress: request.ip,
        });
        return reply.send((0, responseFormatter_js_1.formatSuccess)({
            signed: true,
            signedAt: new Date().toISOString(),
            signedBy: user.email,
        }, "Electronic signature verified and recorded (21 CFR Part 11)"));
    }
    async logout(request, reply) {
        return reply.send((0, responseFormatter_js_1.formatSuccess)(null, "Logged out cleanly"));
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
