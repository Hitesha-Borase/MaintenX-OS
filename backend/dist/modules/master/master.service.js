"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterAdminService = exports.MasterAdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../../config/database.js");
const index_js_1 = require("../../db/schema/index.js");
const AppError_js_1 = require("../../shared/errors/AppError.js");
class MasterAdminService {
    // Helper to append audit records within transactions or standalone
    async writeAudit(params) {
        try {
            await database_js_1.db.insert(index_js_1.auditLogs).values({
                tenantId: params.tenantId,
                userId: params.actor?.userId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                oldValues: params.oldValues || null,
                newValues: params.newValues || null,
                ipAddress: params.actor?.ipAddress || null,
                userAgent: params.actor?.userAgent || null,
            });
        }
        catch (e) {
            console.error("⚠️ Master Admin audit log failed:", e.message);
        }
    }
    // =========================================================================
    // 1. DASHBOARD & CONTROL CENTER
    // =========================================================================
    async getDashboard() {
        // 1. Total, Active, Suspended Companies
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants);
        const totalCompanies = allTenants.length;
        const activeCompanies = allTenants.filter((t) => t.status.toUpperCase() === "ACTIVE").length;
        const suspendedCompanies = allTenants.filter((t) => t.status.toUpperCase() === "SUSPENDED").length;
        // 2. Global Users & Company Admins
        const allUsers = await database_js_1.db.select().from(index_js_1.users);
        const totalUsers = allUsers.length;
        // Company Admins: count users with role 'admin'
        const adminRoles = await database_js_1.db.select().from(index_js_1.roles).where((0, drizzle_orm_1.eq)(index_js_1.roles.code, "admin"));
        let adminUsers = allUsers.filter((u) => u.isMasterAdmin !== true);
        if (adminRoles.length > 0) {
            const adminRoleIds = adminRoles.map((r) => r.id);
            const adminUserRoles = await database_js_1.db
                .select()
                .from(index_js_1.userRoles)
                .where((0, drizzle_orm_1.inArray)(index_js_1.userRoles.roleId, adminRoleIds));
            const adminUserIds = new Set(adminUserRoles.map((ur) => ur.userId));
            if (adminUserIds.size > 0) {
                adminUsers = allUsers.filter((u) => adminUserIds.has(u.id));
            }
        }
        const totalAdmins = adminUsers.length || allTenants.length;
        const activeAdmins = adminUsers.filter((u) => u.status.toUpperCase() === "ACTIVE").length || activeCompanies;
        // 3. Subscriptions & Trial Metrics
        const allSubs = await database_js_1.db.select().from(index_js_1.subscriptions);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // Free Trial Admins (Registered within 7 days, on trial and no active paid sub)
        const freeTrialAdmins = allTenants.filter((t) => {
            const hasPaidSub = allSubs.some((s) => s.tenantId === t.id && s.status.toUpperCase() === "ACTIVE" && Number(s.amount) > 0);
            if (hasPaidSub)
                return false;
            return t.createdAt >= sevenDaysAgo;
        }).length;
        // Expired Trials (Trial period 7 days has passed without active paid sub)
        const expiredTrials = allTenants.filter((t) => {
            const hasPaidSub = allSubs.some((s) => s.tenantId === t.id && s.status.toUpperCase() === "ACTIVE" && Number(s.amount) > 0);
            if (hasPaidSub)
                return false;
            return t.createdAt < sevenDaysAgo;
        }).length;
        // Active Paid Plans vs Expired Paid Plans
        const activePaidPlans = allSubs.filter((s) => s.status.toUpperCase() === "ACTIVE" && new Date(s.currentPeriodEnd) >= now).length;
        const expiredPaidPlans = allSubs.filter((s) => s.status.toUpperCase() !== "ACTIVE" || new Date(s.currentPeriodEnd) < now).length;
        const upcomingRenewals = allSubs.filter((s) => {
            const end = new Date(s.currentPeriodEnd);
            return s.status.toUpperCase() === "ACTIVE" && end > now && end <= thirtyDaysFromNow;
        }).length;
        const activeSubscriptions = activePaidPlans;
        const expiringSubscriptions = upcomingRenewals;
        // 4. Revenue Metrics
        const allPayments = await database_js_1.db.select().from(index_js_1.payments);
        const totalRevenue = allPayments
            .filter((p) => p.status.toUpperCase() === "CAPTURED" || p.status.toUpperCase() === "SUCCESS" || p.status.toUpperCase() === "AUTHORIZED")
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const monthlyRevenue = allSubs
            .filter((s) => s.status.toUpperCase() === "ACTIVE" && new Date(s.currentPeriodEnd) >= now)
            .reduce((sum, s) => {
            const amt = Number(s.amount || 0);
            return sum + (s.billingCycle === "ANNUAL" ? Math.round(amt / 12) : amt);
        }, 0);
        // 5. Support Tickets
        const pendingTicketsResult = await database_js_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(index_js_1.supportTickets)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_1.supportTickets.status, "Open"), (0, drizzle_orm_1.eq)(index_js_1.supportTickets.status, "In Progress")));
        const openSupportTickets = pendingTicketsResult[0]?.count || 0;
        const pendingTickets = openSupportTickets;
        // 5. System Alerts (calculated from recent failed payments + open high-priority tickets)
        const highPriorityTickets = await database_js_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(index_js_1.supportTickets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_1.supportTickets.priority, "High"), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_1.supportTickets.status, "Open"), (0, drizzle_orm_1.eq)(index_js_1.supportTickets.status, "In Progress"))));
        const recentFailedPayments = await database_js_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
            .from(index_js_1.payments)
            .where((0, drizzle_orm_1.eq)(index_js_1.payments.status, "FAILED"));
        const systemAlerts = (highPriorityTickets[0]?.count || 0) + (recentFailedPayments[0]?.count || 0);
        // 6. Plan breakdown distribution
        const planBreakdown = {};
        for (const t of allTenants) {
            const pName = t.plan || "Enterprise";
            planBreakdown[pName] = (planBreakdown[pName] || 0) + 1;
        }
        // 7. Recent Platform Activity (from PostgreSQL audit_logs)
        const recentAudit = await database_js_1.db
            .select({
            id: index_js_1.auditLogs.id,
            action: index_js_1.auditLogs.action,
            entityType: index_js_1.auditLogs.entityType,
            entityId: index_js_1.auditLogs.entityId,
            createdAt: index_js_1.auditLogs.createdAt,
            ipAddress: index_js_1.auditLogs.ipAddress,
            userId: index_js_1.auditLogs.userId,
            tenantId: index_js_1.auditLogs.tenantId,
        })
            .from(index_js_1.auditLogs)
            .orderBy((0, drizzle_orm_1.desc)(index_js_1.auditLogs.createdAt))
            .limit(10);
        // Enrich audit logs with actor emails if available
        const userMap = new Map(allUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
        const tenantMap = new Map(allTenants.map((t) => [t.id, t.name]));
        const activityLogs = recentAudit.map((log) => {
            const actorName = log.userId ? userMap.get(log.userId) || "Master Admin" : "System / Master Admin";
            const targetTenant = log.tenantId ? tenantMap.get(log.tenantId) : undefined;
            return {
                id: log.id,
                action: log.action,
                details: `${actorName} performed ${log.action} on ${log.entityType} (${log.entityId})${targetTenant ? ` for ${targetTenant}` : ""}`,
                date: log.createdAt.toISOString().replace("T", " ").substring(0, 19),
                actor: actorName,
                ip: log.ipAddress || "N/A",
            };
        });
        return {
            kpis: {
                // Standard SaaS Super Admin 10 Metrics (Section 11)
                totalAdmins,
                activeAdmins,
                freeTrialAdmins,
                expiredTrials,
                activePaidPlans,
                expiredPaidPlans,
                totalRevenue,
                monthlyRevenue,
                upcomingRenewals,
                openSupportTickets,
                // Legacy / Additional Metrics
                totalCompanies,
                activeCompanies,
                suspendedCompanies,
                totalUsers,
                activeSubscriptions,
                expiringSubscriptions,
                pendingTickets,
                systemAlerts,
                companyGrowth: "+2 this month",
                userGrowth: "+12% growth",
            },
            planBreakdown,
            activityLogs,
        };
    }
    // =========================================================================
    // 2. COMPANIES MANAGEMENT
    // =========================================================================
    async getCompanies(query) {
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants).orderBy((0, drizzle_orm_1.desc)(index_js_1.tenants.createdAt));
        const allPlants = await database_js_1.db.select().from(index_js_1.plants);
        const allUsers = await database_js_1.db.select().from(index_js_1.users).orderBy((0, drizzle_orm_1.asc)(index_js_1.users.createdAt));
        const allSubs = await database_js_1.db.select().from(index_js_1.subscriptions);
        const allModules = await database_js_1.db.select().from(index_js_1.tenantModules);
        // Grouping by tenant
        const plantCounts = new Map();
        for (const p of allPlants) {
            plantCounts.set(p.tenantId, (plantCounts.get(p.tenantId) || 0) + 1);
        }
        const userCounts = new Map();
        const tenantAdmins = new Map();
        for (const u of allUsers) {
            userCounts.set(u.tenantId, (userCounts.get(u.tenantId) || 0) + 1);
            // Pick first user or admin as primary contact
            if (!tenantAdmins.has(u.tenantId)) {
                tenantAdmins.set(u.tenantId, {
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    phone: u.phone || "",
                    lastLogin: u.lastLoginAt ? u.lastLoginAt.toISOString().replace("T", " ").substring(0, 16) : "Never",
                });
            }
        }
        // Subscriptions map (latest active)
        const tenantSubs = new Map();
        for (const s of allSubs) {
            if (!tenantSubs.has(s.tenantId) || s.status.toUpperCase() === "ACTIVE") {
                tenantSubs.set(s.tenantId, s);
            }
        }
        // Modules map
        const tenantModuleMaps = new Map();
        for (const m of allModules) {
            if (!tenantModuleMaps.has(m.tenantId)) {
                tenantModuleMaps.set(m.tenantId, {});
            }
            tenantModuleMaps.get(m.tenantId)[m.moduleKey] = m.isEnabled;
        }
        const allPlans = await database_js_1.db.select().from(index_js_1.plans);
        const planModulesMap = new Map();
        for (const p of allPlans) {
            if (p.modules && Array.isArray(p.modules)) {
                planModulesMap.set(p.name.toLowerCase().trim(), p.modules);
                planModulesMap.set(p.id.toLowerCase().trim(), p.modules);
            }
        }
        const CANONICAL_PLAN_MODULES = {
            "plant pilot": ["produce"],
            "plant-pilot": ["produce"],
            "trial": ["produce"],
            "starter": ["produce", "verify"],
            "individual modules": ["produce", "verify"],
            "individual-modules": ["produce", "verify"],
            "bundles": ["plan", "produce", "verify", "maintain", "move"],
            "advanced": ["plan", "produce", "verify", "maintain", "move"],
            "maintenx os complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "maintenx-complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "enterprise": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "custom": ["produce"],
            "custom ": ["produce"],
        };
        let result = allTenants.map((t) => {
            const sub = tenantSubs.get(t.id);
            const admin = tenantAdmins.get(t.id) || { name: "System Administrator", email: `admin@${t.slug}.com`, phone: "", lastLogin: "Never" };
            const expiry = sub ? new Date(sub.currentPeriodEnd).toISOString().split("T")[0] : null;
            const subName = sub ? sub.planName : (t.plan || "Plant Pilot");
            // Plan-based module access calculation
            const planKey = (subName || "").toLowerCase().trim();
            const allowedModules = planModulesMap.get(planKey) || CANONICAL_PLAN_MODULES[planKey] || (t.plan?.toUpperCase() === "ENTERPRISE" ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"] : ["produce"]);
            const baseModules = {
                plan: allowedModules.includes("plan"),
                produce: allowedModules.includes("produce"),
                verify: allowedModules.includes("verify"),
                maintain: allowedModules.includes("maintain"),
                move: allowedModules.includes("move"),
                people: allowedModules.includes("people"),
                improve: allowedModules.includes("improve"),
                intelligence: allowedModules.includes("intelligence"),
            };
            const explicitOverrides = tenantModuleMaps.get(t.id);
            const finalModules = explicitOverrides ? { ...baseModules, ...explicitOverrides } : baseModules;
            return {
                id: t.id,
                name: t.name,
                slug: t.slug,
                status: t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase(),
                subscription: subName,
                hasSubscription: Boolean(sub),
                subscriptionId: sub?.id || null,
                admin: admin.name,
                adminEmail: admin.email,
                adminPhone: admin.phone || "",
                usersCount: userCounts.get(t.id) || 1,
                plants: plantCounts.get(t.id) || 1,
                createdAt: t.createdAt.toISOString().split("T")[0],
                expiryDate: expiry,
                lastActivity: admin.lastLogin || t.updatedAt.toISOString().replace("T", " ").substring(0, 16),
                currency: t.settings?.currency || "CAD",
                modules: finalModules,
            };
        });
        // Apply search filter
        if (query?.search) {
            const s = query.search.toLowerCase();
            result = result.filter((c) => c.name.toLowerCase().includes(s) || c.admin.toLowerCase().includes(s) || c.adminEmail.toLowerCase().includes(s));
        }
        // Apply status filter
        if (query?.status && query.status !== "All") {
            if (query.status === "Expired") {
                const today = new Date().toISOString().split("T")[0];
                result = result.filter((c) => c.expiryDate !== null && c.expiryDate < today);
            }
            else {
                result = result.filter((c) => c.status.toLowerCase() === query.status.toLowerCase() || c.subscription.toLowerCase() === query.status.toLowerCase());
            }
        }
        // Exclude DEACTIVATED tenants from default listing unless explicitly queried
        if (query?.status?.toLowerCase() !== "deactivated") {
            result = result.filter((c) => c.status.toLowerCase() !== "deactivated");
        }
        return result;
    }
    async getCompanyById(id) {
        const [tenant] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id)).limit(1);
        if (!tenant) {
            throw new AppError_js_1.NotFoundError(`Company with ID '${id}' not found`);
        }
        // 1. Plants
        const companyPlants = await database_js_1.db.select().from(index_js_1.plants).where((0, drizzle_orm_1.eq)(index_js_1.plants.tenantId, id));
        // 2. Users & Admins
        const companyUsers = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.tenantId, id)).orderBy((0, drizzle_orm_1.asc)(index_js_1.users.createdAt));
        const adminRoles = await database_js_1.db.select().from(index_js_1.roles).where((0, drizzle_orm_1.eq)(index_js_1.roles.code, "admin"));
        const adminRoleIds = new Set(adminRoles.map((r) => r.id));
        // 3. Subscriptions
        const companySubs = await database_js_1.db
            .select()
            .from(index_js_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.tenantId, id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_1.subscriptions.createdAt));
        // 4. Modules
        const activeSub = companySubs[0];
        const subPlanName = activeSub?.planName || tenant.plan || "Plant Pilot";
        const planKey = (subPlanName || "").toLowerCase().trim();
        const CANONICAL_PLAN_MODULES = {
            "plant pilot": ["produce"],
            "plant-pilot": ["produce"],
            "trial": ["produce"],
            "starter": ["produce", "verify"],
            "individual modules": ["produce", "verify"],
            "individual-modules": ["produce", "verify"],
            "bundles": ["plan", "produce", "verify", "maintain", "move"],
            "advanced": ["plan", "produce", "verify", "maintain", "move"],
            "maintenx os complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "maintenx-complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "enterprise": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "custom": ["produce"],
            "custom ": ["produce"],
        };
        const allowedMods = CANONICAL_PLAN_MODULES[planKey] || (tenant.plan?.toUpperCase() === "ENTERPRISE" ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"] : ["produce"]);
        const compModules = await database_js_1.db.select().from(index_js_1.tenantModules).where((0, drizzle_orm_1.eq)(index_js_1.tenantModules.tenantId, id));
        const modulesMap = {
            plan: allowedMods.includes("plan"),
            produce: allowedMods.includes("produce"),
            verify: allowedMods.includes("verify"),
            maintain: allowedMods.includes("maintain"),
            move: allowedMods.includes("move"),
            people: allowedMods.includes("people"),
            improve: allowedMods.includes("improve"),
            intelligence: allowedMods.includes("intelligence"),
        };
        for (const m of compModules) {
            modulesMap[m.moduleKey] = m.isEnabled;
        }
        // 5. Recent Activity for this company
        const companyAudit = await database_js_1.db
            .select()
            .from(index_js_1.auditLogs)
            .where((0, drizzle_orm_1.eq)(index_js_1.auditLogs.tenantId, id))
            .orderBy((0, drizzle_orm_1.desc)(index_js_1.auditLogs.createdAt))
            .limit(10);
        const primaryAdmin = companyUsers[0];
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1).toLowerCase(),
            subscription: subPlanName,
            hasSubscription: Boolean(activeSub),
            subscriptionId: activeSub?.id || null,
            admin: primaryAdmin ? `${primaryAdmin.firstName} ${primaryAdmin.lastName}` : "System Admin",
            adminEmail: primaryAdmin ? primaryAdmin.email : `admin@${tenant.slug}.com`,
            usersCount: companyUsers.length,
            plants: companyPlants.length,
            createdAt: tenant.createdAt.toISOString().split("T")[0],
            expiryDate: activeSub ? new Date(activeSub.currentPeriodEnd).toISOString().split("T")[0] : null,
            lastActivity: primaryAdmin?.lastLoginAt?.toISOString().replace("T", " ").substring(0, 16) || "N/A",
            currency: tenant.settings?.currency || "CAD",
            modules: modulesMap,
            plantsList: companyPlants.map((p) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                location: `${p.city}, ${p.state || ""}, ${p.country || ""}`,
                lines: 3,
                capacity: "250,000 Units/Day",
                status: p.isActive ? "Operational" : "Maintenance",
            })),
            usersList: companyUsers.map((u) => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                status: u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase(),
                lastLogin: u.lastLoginAt?.toISOString().replace("T", " ").substring(0, 16) || "Never",
            })),
            subscriptionsList: companySubs,
            activityList: companyAudit.map((a) => ({
                id: a.id,
                action: a.action,
                date: a.createdAt.toISOString().replace("T", " ").substring(0, 19),
                details: `${a.action} on ${a.entityType}`,
            })),
            settings: tenant.settings || {},
        };
    }
    async createCompany(input, actor) {
        if (!input.name || !input.admin || !input.adminEmail) {
            throw new AppError_js_1.ValidationError("Company name, administrator name, and email are required");
        }
        const client = await database_js_1.pool.connect();
        try {
            await client.query("BEGIN");
            // 1. Enforce unique company name
            const { rows: existingTenants } = await client.query("SELECT id FROM tenants WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1", [input.name.trim()]);
            if (existingTenants.length > 0) {
                throw new AppError_js_1.ValidationError(`A company with name "${input.name.trim()}" already exists. Duplicate company name is not allowed.`);
            }
            // 2. Enforce unique admin email
            const { rows: existingUsers } = await client.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1", [input.adminEmail.trim()]);
            if (existingUsers.length > 0) {
                throw new AppError_js_1.ValidationError(`A user with email "${input.adminEmail.trim()}" already exists. Duplicate email is not allowed.`);
            }
            // 3. Enforce unique admin mobile number (if provided)
            if (input.adminPhone && input.adminPhone.trim()) {
                const cleanPhone = input.adminPhone.trim();
                const { rows: existingPhones } = await client.query("SELECT id FROM users WHERE TRIM(phone) = TRIM($1) AND phone != '' LIMIT 1", [cleanPhone]);
                if (existingPhones.length > 0) {
                    throw new AppError_js_1.ValidationError(`A user with mobile number "${cleanPhone}" already exists. Duplicate mobile number is not allowed.`);
                }
            }
            const slug = input.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .replace(/-+/g, "-")
                .substring(0, 50) + `-${Date.now().toString(36)}`;
            // 1. Create Tenant
            const planName = input.subscription?.trim() || "Plant Pilot";
            const { rows: tenantRows } = await client.query(`INSERT INTO tenants (name, slug, plan, status, settings)
         VALUES ($1, $2, $3, 'ACTIVE', $4)
         RETURNING *`, [input.name, slug, planName, JSON.stringify({ currency: input.currency || "CAD" })]);
            const newTenant = tenantRows[0];
            // 2. Create Default Plant
            const plantCode = `${input.name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "PLT"}-01`;
            await client.query(`INSERT INTO plants (tenant_id, code, name, city, state, country)
         VALUES ($1, $2, $3, 'Primary Facility', 'HQ', 'India')`, [newTenant.id, plantCode, `${input.name} Main Site`]);
            // 3. Create Admin User
            const [firstName, ...lastNames] = input.admin.trim().split(" ");
            const lastName = lastNames.join(" ") || "Admin";
            const rawPassword = (input.password || "").trim() || "Password@123";
            const passwordHash = await bcryptjs_1.default.hash(rawPassword, 10);
            const defaultPinHash = await bcryptjs_1.default.hash("1234", 10);
            const { rows: userRows } = await client.query(`INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, phone, digital_signature_pin_hash, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
         ON CONFLICT (email) DO UPDATE SET
           tenant_id = EXCLUDED.tenant_id,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           phone = COALESCE(EXCLUDED.phone, users.phone),
           status = 'ACTIVE'
         RETURNING *`, [newTenant.id, input.adminEmail.toLowerCase().trim(), passwordHash, firstName, lastName, input.adminPhone || null, defaultPinHash]);
            const newUser = userRows[0];
            // 4. Assign Admin Role
            let roleId;
            const { rows: roleRows } = await client.query(`SELECT id FROM roles WHERE code = 'admin' LIMIT 1`);
            if (roleRows.length > 0) {
                roleId = roleRows[0].id;
            }
            else {
                const { rows: newRoleRows } = await client.query(`INSERT INTO roles (code, name, description, is_system) VALUES ('admin', 'Company Administrator', 'Full company governance, master data, security, user administration', true) RETURNING id`);
                roleId = newRoleRows[0]?.id;
            }
            if (roleId) {
                await client.query(`INSERT INTO user_roles ("userId", "roleId") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newUser.id, roleId]);
            }
            // 5. Seed Plan-Specific Module Entitlements
            const CANONICAL_PLAN_MODULES = {
                "plant pilot": ["produce"],
                "plant-pilot": ["produce"],
                "trial": ["produce"],
                "starter": ["produce", "verify"],
                "individual modules": ["produce", "verify"],
                "individual-modules": ["produce", "verify"],
                "bundles": ["plan", "produce", "verify", "maintain", "move"],
                "advanced": ["plan", "produce", "verify", "maintain", "move"],
                "maintenx os complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
                "maintenx-complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
                "enterprise": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
                "custom": ["produce"],
                "custom ": ["produce"],
            };
            const planKey = (planName || "").toLowerCase().trim();
            const planAllowedMods = CANONICAL_PLAN_MODULES[planKey] || (planName?.toUpperCase() === "ENTERPRISE" ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"] : ["produce"]);
            const coreModules = ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"];
            for (const mod of coreModules) {
                const isModEnabled = planAllowedMods.includes(mod);
                await client.query(`INSERT INTO tenant_modules (tenant_id, module_key, is_enabled)
           VALUES ($1, $2, $3)
           ON CONFLICT (tenant_id, module_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()`, [newTenant.id, mod, isModEnabled]);
            }
            // 6. Create Initial Subscription (7-day trial for trial/pilot signups, 1 year for enterprise)
            const isTrialPlan = !planName || planName.toLowerCase().includes("pilot") || planName.toLowerCase().includes("trial");
            const trialPeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const oneYearLater = new Date();
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            const subStatus = isTrialPlan ? "TRIAL" : "ACTIVE";
            const subBillingCycle = isTrialPlan ? "TRIAL_7_DAYS" : "ANNUAL";
            const subAmount = isTrialPlan ? 0 : 34990;
            const subPeriodEnd = isTrialPlan ? trialPeriodEnd : oneYearLater;
            await client.query(`INSERT INTO subscriptions (tenant_id, plan_id, plan_name, status, billing_cycle, amount, currency, current_period_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [newTenant.id, isTrialPlan ? "pilot" : "bundles", planName, subStatus, subBillingCycle, subAmount, input.currency || "CAD", subPeriodEnd]);
            // 7. Commit Transaction
            await client.query("COMMIT");
            // 8. Log Audit Event
            await this.writeAudit({
                actor,
                action: "COMPANY_CREATED",
                entityType: "Tenant",
                entityId: newTenant.id,
                tenantId: newTenant.id,
                newValues: { name: input.name, slug, plan: planName, adminEmail: input.adminEmail },
            });
            return {
                id: newTenant.id,
                name: newTenant.name,
                slug: newTenant.slug,
                status: "Active",
                subscription: planName,
                admin: input.admin,
                adminEmail: input.adminEmail,
                adminPhone: input.adminPhone || "",
                usersCount: 1,
                plants: 1,
                createdAt: (newTenant.created_at || newTenant.createdAt || new Date()).toISOString(),
                expiryDate: subPeriodEnd.toISOString(),
                currency: input.currency || "CAD",
            };
        }
        catch (error) {
            await client.query("ROLLBACK");
            throw error;
        }
        finally {
            client.release();
        }
    }
    async updateCompanyStatus(id, newStatus, actor) {
        const [company] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id)).limit(1);
        if (!company)
            throw new AppError_js_1.NotFoundError("Company not found");
        const normalizedStatus = newStatus.toUpperCase();
        await database_js_1.db
            .update(index_js_1.tenants)
            .set({ status: normalizedStatus, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id));
        await this.writeAudit({
            actor,
            action: "COMPANY_STATUS_UPDATED",
            entityType: "Tenant",
            entityId: id,
            tenantId: id,
            oldValues: { status: company.status },
            newValues: { status: normalizedStatus },
        });
        return { id, status: newStatus };
    }
    async updateCompanyDetails(id, updates, actor) {
        const [company] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id)).limit(1);
        if (!company)
            throw new AppError_js_1.NotFoundError("Company not found");
        const patch = { updatedAt: new Date() };
        if (updates.name)
            patch.name = updates.name;
        if (updates.subscription)
            patch.plan = updates.subscription;
        await database_js_1.db.update(index_js_1.tenants).set(patch).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id));
        if (updates.subscription) {
            const planName = updates.subscription;
            const isTrialPlan = planName.toLowerCase().includes("pilot") || planName.toLowerCase().includes("trial");
            const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            // Update active subscription plan name and status
            await database_js_1.db
                .update(index_js_1.subscriptions)
                .set({
                planName,
                status: isTrialPlan ? "TRIAL" : "ACTIVE",
                currentPeriodEnd: thirtyDaysLater,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.tenantId, id));
            const CANONICAL_PLAN_MODULES = {
                "plant pilot": ["produce"],
                "pilot": ["produce"],
                "trial": ["produce"],
                "starter": ["produce", "verify"],
                "individual modules": ["produce", "verify"],
                "individual-modules": ["produce", "verify"],
                "bundles": ["plan", "produce", "verify", "maintain", "move"],
                "advanced": ["plan", "produce", "verify", "maintain", "move"],
                "maintenx os complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
                "maintenx-complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
                "enterprise": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            };
            const planKey = (planName || "").toLowerCase().trim();
            const planAllowedMods = CANONICAL_PLAN_MODULES[planKey] || (planName.toUpperCase() === "ENTERPRISE" || planKey.includes("complete")
                ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"]
                : planKey.includes("bundle")
                    ? ["plan", "produce", "verify", "maintain", "move"]
                    : ["produce"]);
            const coreModules = ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"];
            for (const mod of coreModules) {
                const isModEnabled = planAllowedMods.includes(mod);
                await database_js_1.pool.query(`INSERT INTO tenant_modules (tenant_id, module_key, is_enabled)
           VALUES ($1, $2, $3)
           ON CONFLICT (tenant_id, module_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()`, [id, mod, isModEnabled]);
            }
        }
        // Update Primary Admin user details if supplied
        if (updates.adminName || updates.adminEmail || updates.adminPhone !== undefined) {
            const companyUsers = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.tenantId, id));
            if (companyUsers.length > 0) {
                const primaryAdmin = companyUsers[0];
                const userPatch = { updatedAt: new Date() };
                if (updates.adminName) {
                    const [firstName, ...lastNames] = updates.adminName.trim().split(" ");
                    userPatch.firstName = firstName;
                    userPatch.lastName = lastNames.join(" ") || "Admin";
                }
                if (updates.adminEmail) {
                    userPatch.email = updates.adminEmail.trim();
                }
                if (updates.adminPhone !== undefined) {
                    userPatch.phone = updates.adminPhone.trim();
                }
                await database_js_1.db.update(index_js_1.users).set(userPatch).where((0, drizzle_orm_1.eq)(index_js_1.users.id, primaryAdmin.id));
            }
        }
        await this.writeAudit({
            actor,
            action: "COMPANY_UPDATED",
            entityType: "Tenant",
            entityId: id,
            tenantId: id,
            oldValues: { name: company.name, plan: company.plan },
            newValues: updates,
        });
        return { id, ...updates };
    }
    async deleteCompany(id, actor) {
        const [company] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id)).limit(1);
        if (!company)
            throw new AppError_js_1.NotFoundError("Company not found");
        await this.writeAudit({
            actor,
            action: "COMPANY_DELETED",
            entityType: "Tenant",
            entityId: id,
            tenantId: id,
            oldValues: { name: company.name, slug: company.slug, status: company.status },
            newValues: { deleted: true },
        });
        // Delete company from PostgreSQL (cascades to plants, users, modules, subscriptions, etc.)
        await database_js_1.db.delete(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, id));
        return { success: true, message: `Company '${company.name}' deleted successfully.` };
    }
    // =========================================================================
    // 3. COMPANY ADMINISTRATORS
    // =========================================================================
    async getCompanyAdmins(query) {
        const adminRoles = await database_js_1.db.select().from(index_js_1.roles).where((0, drizzle_orm_1.eq)(index_js_1.roles.code, "admin"));
        if (adminRoles.length === 0)
            return [];
        const adminRoleIds = adminRoles.map((r) => r.id);
        const assignedUserRoles = await database_js_1.db
            .select()
            .from(index_js_1.userRoles)
            .where((0, drizzle_orm_1.inArray)(index_js_1.userRoles.roleId, adminRoleIds));
        const userIds = [...new Set(assignedUserRoles.map((ur) => ur.userId))];
        if (userIds.length === 0)
            return [];
        const adminUsers = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.inArray)(index_js_1.users.id, userIds));
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants);
        const tenantMap = new Map(allTenants.map((t) => [t.id, t.name]));
        let results = adminUsers.map((u) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            company: tenantMap.get(u.tenantId) || "Platform Enterprise",
            tenantId: u.tenantId,
            role: "Company Admin",
            status: u.status.toUpperCase() === "ACTIVE" ? "Active" : "Suspended",
            lastLogin: u.lastLoginAt ? u.lastLoginAt.toISOString().replace("T", " ").substring(0, 16) : "Never",
            createdAt: u.createdAt.toISOString().split("T")[0],
        }));
        if (query?.search) {
            const s = query.search.toLowerCase();
            results = results.filter((a) => a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s) || a.company.toLowerCase().includes(s));
        }
        if (query?.status && query.status !== "All") {
            results = results.filter((a) => a.status.toLowerCase() === query.status.toLowerCase());
        }
        return results;
    }
    async createCompanyAdmin(input, actor) {
        if (!input.name) {
            throw new AppError_js_1.ValidationError("Administrator name is required");
        }
        let tenant = null;
        if (input.companyId) {
            const [t] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, input.companyId)).limit(1);
            tenant = t;
        }
        else if (input.company) {
            const [t] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.name, input.company)).limit(1);
            tenant = t;
        }
        if (!tenant) {
            const [firstTenant] = await database_js_1.db.select().from(index_js_1.tenants).limit(1);
            tenant = firstTenant;
        }
        if (!tenant) {
            throw new AppError_js_1.ValidationError("No tenant company found to associate administrator with");
        }
        const [firstName, ...lastNames] = input.name.trim().split(" ");
        const lastName = lastNames.join(" ") || "Admin";
        const email = (input.email && input.email.trim())
            ? input.email.toLowerCase().trim()
            : `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now().toString(36)}@${tenant.slug}.com`;
        const rawPassword = (input.password || "").trim() || "Password@123";
        const passwordHash = await bcryptjs_1.default.hash(rawPassword, 10);
        const defaultPinHash = await bcryptjs_1.default.hash("1234", 10);
        const client = await database_js_1.pool.connect();
        try {
            await client.query("BEGIN");
            // Check if email already exists
            const { rows: existingUsers } = await client.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1", [email]);
            if (existingUsers.length > 0) {
                throw new AppError_js_1.ValidationError(`A user with email "${email}" already exists. Duplicate email is not allowed.`);
            }
            const { rows: userRows } = await client.query(`INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, digital_signature_pin_hash, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
         RETURNING *`, [tenant.id, email, passwordHash, firstName, lastName, defaultPinHash]);
            const newUser = userRows[0];
            let roleId;
            const { rows: roleRows } = await client.query(`SELECT id FROM roles WHERE code = 'admin' LIMIT 1`);
            if (roleRows.length > 0) {
                roleId = roleRows[0].id;
            }
            else {
                const { rows: newRoleRows } = await client.query(`INSERT INTO roles (code, name, description, is_system) VALUES ('admin', 'Company Administrator', 'Full company governance, master data, security, user administration', true) RETURNING id`);
                roleId = newRoleRows[0]?.id;
            }
            if (roleId) {
                await client.query(`INSERT INTO user_roles ("userId", "roleId") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newUser.id, roleId]);
            }
            await client.query("COMMIT");
            await this.writeAudit({
                actor,
                action: "ADMIN_CREATED",
                entityType: "User",
                entityId: newUser.id,
                tenantId: tenant.id,
                newValues: { name: input.name, email, company: tenant.name },
            });
            return {
                id: newUser.id,
                name: `${newUser.first_name} ${newUser.last_name}`,
                email: newUser.email,
                company: tenant.name,
                tenantId: tenant.id,
                role: "Company Admin",
                status: "Active",
                lastLogin: "Never",
                createdAt: newUser.created_at.toISOString().split("T")[0],
            };
        }
        catch (err) {
            await client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    }
    async updateCompanyAdmin(id, updates, actor) {
        const [user] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, id)).limit(1);
        if (!user)
            throw new AppError_js_1.NotFoundError("Admin user not found");
        const patch = { updatedAt: new Date() };
        if (updates.name) {
            const [firstName, ...lastNames] = updates.name.trim().split(" ");
            patch.firstName = firstName;
            patch.lastName = lastNames.join(" ") || "Admin";
        }
        await database_js_1.db.update(index_js_1.users).set(patch).where((0, drizzle_orm_1.eq)(index_js_1.users.id, id));
        await this.writeAudit({
            actor,
            action: "ADMIN_UPDATED",
            entityType: "User",
            entityId: id,
            tenantId: user.tenantId,
            newValues: updates,
        });
        return { id, ...updates };
    }
    async updateAdminStatus(id, newStatus, actor) {
        const [user] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, id)).limit(1);
        if (!user)
            throw new AppError_js_1.NotFoundError("Admin user not found");
        const normalized = newStatus.toUpperCase() === "ACTIVE" ? "ACTIVE" : "SUSPENDED";
        await database_js_1.db.update(index_js_1.users).set({ status: normalized, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_1.users.id, id));
        await this.writeAudit({
            actor,
            action: "ADMIN_STATUS_CHANGED",
            entityType: "User",
            entityId: id,
            tenantId: user.tenantId,
            oldValues: { status: user.status },
            newValues: { status: normalized },
        });
        return { id, status: normalized === "ACTIVE" ? "Active" : "Suspended" };
    }
    async resetAdminPassword(id, actor) {
        const [user] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, id)).limit(1);
        if (!user)
            throw new AppError_js_1.NotFoundError("Admin user not found");
        const tempPassword = `Temp@${Math.floor(100000 + Math.random() * 900000)}`;
        const newHash = await bcryptjs_1.default.hash(tempPassword, 10);
        await database_js_1.db.update(index_js_1.users).set({ passwordHash: newHash, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_1.users.id, id));
        await this.writeAudit({
            actor,
            action: "PASSWORD_RESET_TRIGGERED",
            entityType: "User",
            entityId: id,
            tenantId: user.tenantId,
        });
        return {
            success: true,
            message: `Password reset successfully for ${user.email}. Temporary credentials issued.`,
            tempPassword,
        };
    }
    // =========================================================================
    // 4. PLANS & PRICING
    // =========================================================================
    async getPlans() {
        const allPlans = await database_js_1.db.select().from(index_js_1.plans).orderBy((0, drizzle_orm_1.asc)(index_js_1.plans.priceMonthly));
        return allPlans.map((p) => ({
            id: p.id,
            name: p.name,
            subtitle: p.subtitle,
            priceMonthly: Number(p.priceMonthly),
            priceAnnual: Number(p.priceAnnual),
            currency: p.currency,
            duration: p.duration,
            userLimit: p.userLimit,
            accessLevel: p.accessLevel,
            status: p.status,
            isPopular: p.isPopular,
            ctaText: p.ctaText,
            modules: p.modules,
            features: p.features,
        }));
    }
    async createPlan(input, actor) {
        if (!input.name || input.priceMonthly === undefined) {
            throw new AppError_js_1.ValidationError("Plan name and monthly price are required");
        }
        const planId = input.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        const [newPlan] = await database_js_1.db
            .insert(index_js_1.plans)
            .values({
            id: planId,
            name: input.name,
            subtitle: input.subtitle || "SaaS Production Plan",
            priceMonthly: String(input.priceMonthly),
            priceAnnual: String(input.priceAnnual || input.priceMonthly * 10),
            currency: input.currency || "CAD",
            duration: input.duration || "Unlimited",
            userLimit: input.userLimit || 10,
            accessLevel: input.accessLevel || "Standard",
            status: input.status || "Active",
            isPopular: input.isPopular || false,
            ctaText: input.ctaText || "Choose Plan",
            modules: input.modules || ["produce"],
            features: input.features || ["Standard Modules Access", "Platform Support"],
        })
            .returning();
        await this.writeAudit({
            actor,
            action: "PLAN_CREATED",
            entityType: "Plan",
            entityId: newPlan.id,
            newValues: input,
        });
        return newPlan;
    }
    async updatePlan(id, updates, actor) {
        let existing = (await database_js_1.db.select().from(index_js_1.plans).where((0, drizzle_orm_1.eq)(index_js_1.plans.id, id)).limit(1))[0];
        if (!existing) {
            const all = await database_js_1.db.select().from(index_js_1.plans);
            existing = all.find((p) => p.id === id || (updates.name && p.name.toLowerCase() === updates.name.toLowerCase()));
        }
        if (!existing) {
            // Upsert if completely missing
            const input = {
                id,
                name: updates.name || id,
                subtitle: updates.subtitle || "",
                priceMonthly: String(updates.priceMonthly || 0),
                priceAnnual: String(updates.priceAnnual || 0),
                currency: updates.currency || "CAD",
                duration: updates.duration || "Unlimited",
                userLimit: updates.userLimit || 10,
                accessLevel: updates.accessLevel || "Standard",
                status: updates.status || "Active",
                isPopular: !!updates.isPopular,
                ctaText: updates.ctaText || "Choose Modules",
                modules: updates.modules || ["produce"],
                features: updates.features || [],
            };
            const [newPlan] = await database_js_1.db.insert(index_js_1.plans).values(input).returning();
            return newPlan;
        }
        const targetId = existing.id;
        const patch = { updatedAt: new Date() };
        if (updates.name)
            patch.name = updates.name;
        if (updates.subtitle !== undefined)
            patch.subtitle = updates.subtitle;
        if (updates.priceMonthly !== undefined)
            patch.priceMonthly = String(updates.priceMonthly);
        if (updates.priceAnnual !== undefined)
            patch.priceAnnual = String(updates.priceAnnual);
        if (updates.currency)
            patch.currency = updates.currency;
        if (updates.userLimit !== undefined)
            patch.userLimit = updates.userLimit;
        if (updates.status)
            patch.status = updates.status;
        if (updates.isPopular !== undefined)
            patch.isPopular = updates.isPopular;
        if (updates.modules)
            patch.modules = updates.modules;
        if (updates.features)
            patch.features = updates.features;
        const [updated] = await database_js_1.db.update(index_js_1.plans).set(patch).where((0, drizzle_orm_1.eq)(index_js_1.plans.id, targetId)).returning();
        await this.writeAudit({
            actor,
            action: "PLAN_UPDATED",
            entityType: "Plan",
            entityId: targetId,
            oldValues: existing,
            newValues: patch,
        });
        return updated;
    }
    async updatePlanStatus(id, status, actor) {
        let existing = (await database_js_1.db.select().from(index_js_1.plans).where((0, drizzle_orm_1.eq)(index_js_1.plans.id, id)).limit(1))[0];
        if (!existing) {
            const all = await database_js_1.db.select().from(index_js_1.plans);
            existing = all.find((p) => p.id === id);
        }
        if (!existing)
            throw new AppError_js_1.NotFoundError(`Plan '${id}' not found`);
        const targetId = existing.id;
        await database_js_1.db.update(index_js_1.plans).set({ status, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_1.plans.id, targetId));
        await this.writeAudit({
            actor,
            action: "PLAN_STATUS_UPDATED",
            entityType: "Plan",
            entityId: targetId,
            oldValues: { status: existing.status },
            newValues: { status },
        });
        return { id: targetId, status };
    }
    async deletePlan(id, actor) {
        const [existing] = await database_js_1.db.select().from(index_js_1.plans).where((0, drizzle_orm_1.eq)(index_js_1.plans.id, id)).limit(1);
        if (!existing)
            throw new AppError_js_1.NotFoundError(`Plan '${id}' not found`);
        // Always hard-delete plan from PostgreSQL table
        await database_js_1.db.delete(index_js_1.plans).where((0, drizzle_orm_1.eq)(index_js_1.plans.id, id));
        await this.writeAudit({
            actor,
            action: "PLAN_DELETED",
            entityType: "Plan",
            entityId: id,
            oldValues: existing,
        });
        return { success: true, message: `Plan '${id}' removed successfully.` };
    }
    // =========================================================================
    // 5. SUBSCRIPTIONS
    // =========================================================================
    async getSubscriptions(query) {
        const allSubs = await database_js_1.db.select().from(index_js_1.subscriptions).orderBy((0, drizzle_orm_1.desc)(index_js_1.subscriptions.createdAt));
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants);
        const allUsers = await database_js_1.db.select().from(index_js_1.users).orderBy((0, drizzle_orm_1.asc)(index_js_1.users.createdAt));
        const allPlants = await database_js_1.db.select().from(index_js_1.plants);
        const tenantMap = new Map(allTenants.map((t) => [t.id, t]));
        const plantCounts = new Map();
        for (const p of allPlants)
            plantCounts.set(p.tenantId, (plantCounts.get(p.tenantId) || 0) + 1);
        const userCounts = new Map();
        const tenantAdmins = new Map();
        for (const u of allUsers) {
            userCounts.set(u.tenantId, (userCounts.get(u.tenantId) || 0) + 1);
            if (!tenantAdmins.has(u.tenantId)) {
                tenantAdmins.set(u.tenantId, {
                    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
                    email: u.email,
                    phone: u.phone || "",
                });
            }
        }
        let results = allSubs.map((s) => {
            const tenant = tenantMap.get(s.tenantId);
            const admin = tenantAdmins.get(s.tenantId) || { name: "Company Admin", email: `admin@${tenant?.slug || "company"}.com`, phone: "" };
            const exp = s.currentPeriodEnd ? s.currentPeriodEnd.toISOString().split("T")[0] : null;
            return {
                id: s.id,
                tenantId: s.tenantId,
                company: tenant ? tenant.name : "Enterprise Company",
                name: tenant ? tenant.name : "Enterprise Company",
                admin: admin.name,
                adminEmail: admin.email,
                adminPhone: admin.phone,
                usersCount: userCounts.get(s.tenantId) || 1,
                plants: plantCounts.get(s.tenantId) || 1,
                plan: s.planName,
                planId: s.planId,
                status: s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase(),
                billingCycle: s.billingCycle,
                amount: Number(s.amount),
                currency: s.currency,
                startDate: s.currentPeriodStart.toISOString().split("T")[0],
                endDate: exp,
                expiryDate: exp,
                renewalDate: exp,
                hasSubscription: true,
                razorpaySubscriptionId: s.razorpaySubscriptionId || "N/A",
            };
        });
        if (query?.search) {
            const q = query.search.toLowerCase();
            results = results.filter((s) => s.company.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q) || s.admin.toLowerCase().includes(q) || s.adminEmail.toLowerCase().includes(q));
        }
        if (query?.plan && query.plan !== "All") {
            results = results.filter((s) => s.plan.toLowerCase() === query.plan.toLowerCase());
        }
        if (query?.status && query.status !== "All") {
            results = results.filter((s) => s.status.toLowerCase() === query.status.toLowerCase());
        }
        return results;
    }
    async extendSubscription(subscriptionIdOrCompanyId, actor) {
        // Look up by subscription ID or tenant ID
        let [sub] = await database_js_1.db.select().from(index_js_1.subscriptions).where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.id, subscriptionIdOrCompanyId)).limit(1);
        if (!sub) {
            [sub] = await database_js_1.db.select().from(index_js_1.subscriptions).where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.tenantId, subscriptionIdOrCompanyId)).limit(1);
        }
        if (!sub) {
            throw new AppError_js_1.NotFoundError("Subscription not found");
        }
        const currentExpiry = new Date(sub.currentPeriodEnd);
        currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
        await database_js_1.db
            .update(index_js_1.subscriptions)
            .set({
            currentPeriodEnd: currentExpiry,
            status: "ACTIVE",
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.id, sub.id));
        await this.writeAudit({
            actor,
            action: "SUBSCRIPTION_EXTENDED",
            entityType: "Subscription",
            entityId: sub.id,
            tenantId: sub.tenantId,
            oldValues: { currentPeriodEnd: sub.currentPeriodEnd },
            newValues: { currentPeriodEnd: currentExpiry },
        });
        return { id: sub.id, currentPeriodEnd: currentExpiry.toISOString().split("T")[0] };
    }
    async cancelSubscription(subscriptionIdOrCompanyId, actor) {
        let [sub] = await database_js_1.db.select().from(index_js_1.subscriptions).where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.id, subscriptionIdOrCompanyId)).limit(1);
        if (!sub) {
            [sub] = await database_js_1.db.select().from(index_js_1.subscriptions).where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.tenantId, subscriptionIdOrCompanyId)).limit(1);
        }
        if (!sub)
            throw new AppError_js_1.NotFoundError("Subscription not found");
        await database_js_1.db
            .update(index_js_1.subscriptions)
            .set({ status: "CANCELLED", updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.id, sub.id));
        // Also suspend tenant account
        await database_js_1.db.update(index_js_1.tenants).set({ status: "SUSPENDED", updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, sub.tenantId));
        await this.writeAudit({
            actor,
            action: "SUBSCRIPTION_CANCELLED",
            entityType: "Subscription",
            entityId: sub.id,
            tenantId: sub.tenantId,
            newValues: { status: "CANCELLED" },
        });
        return { id: sub.id, status: "CANCELLED" };
    }
    // =========================================================================
    // 6. PAYMENTS & INVOICING
    // =========================================================================
    async getPayments(query) {
        const allPayments = await database_js_1.db.select().from(index_js_1.payments).orderBy((0, drizzle_orm_1.desc)(index_js_1.payments.createdAt));
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants);
        const tenantMap = new Map(allTenants.map((t) => [t.id, t.name]));
        let results = allPayments.map((p) => ({
            id: p.receiptNumber || p.orderId || `INV-${p.id.substring(0, 8).toUpperCase()}`,
            paymentUuid: p.id,
            company: tenantMap.get(p.tenantId) || "Enterprise Customer",
            tenantId: p.tenantId,
            amount: Number(p.amount),
            currency: p.currency,
            date: p.createdAt.toISOString().split("T")[0],
            status: p.status === "CAPTURED" || p.status === "PAID" ? "Paid" : p.status === "FAILED" ? "Overdue" : "Pending",
            method: p.method || "Razorpay / Bank Transfer",
            plan: "Enterprise Annual",
            orderId: p.orderId,
            paymentId: p.paymentId,
        }));
        if (query?.search) {
            const q = query.search.toLowerCase();
            results = results.filter((p) => p.company.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
        }
        if (query?.status && query.status !== "All") {
            results = results.filter((p) => p.status.toLowerCase() === query.status.toLowerCase());
        }
        const totalRevenue = results.filter((p) => p.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
        const overdueAmount = results.filter((p) => p.status === "Overdue").reduce((acc, curr) => acc + curr.amount, 0);
        return {
            payments: results,
            totalRevenue,
            overdueAmount,
        };
    }
    async markPaymentPaid(paymentIdOrReceipt, actor) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentIdOrReceipt);
        const whereClause = isUuid
            ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_1.payments.id, paymentIdOrReceipt), (0, drizzle_orm_1.eq)(index_js_1.payments.receiptNumber, paymentIdOrReceipt), (0, drizzle_orm_1.eq)(index_js_1.payments.orderId, paymentIdOrReceipt))
            : (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_1.payments.receiptNumber, paymentIdOrReceipt), (0, drizzle_orm_1.eq)(index_js_1.payments.orderId, paymentIdOrReceipt));
        let [paymentRecord] = await database_js_1.db
            .select()
            .from(index_js_1.payments)
            .where(whereClause)
            .limit(1);
        if (!paymentRecord)
            throw new AppError_js_1.NotFoundError("Payment record not found");
        await database_js_1.db
            .update(index_js_1.payments)
            .set({ status: "CAPTURED", updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(index_js_1.payments.id, paymentRecord.id));
        await this.writeAudit({
            actor,
            action: "PAYMENT_MARKED_PAID",
            entityType: "Payment",
            entityId: paymentRecord.id,
            tenantId: paymentRecord.tenantId,
            oldValues: { status: paymentRecord.status },
            newValues: { status: "CAPTURED" },
        });
        return { id: paymentIdOrReceipt, status: "Paid" };
    }
    async getInvoiceData(paymentIdOrReceipt) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentIdOrReceipt);
        const whereClause = isUuid
            ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_1.payments.id, paymentIdOrReceipt), (0, drizzle_orm_1.eq)(index_js_1.payments.receiptNumber, paymentIdOrReceipt), (0, drizzle_orm_1.eq)(index_js_1.payments.orderId, paymentIdOrReceipt))
            : (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(index_js_1.payments.receiptNumber, paymentIdOrReceipt), (0, drizzle_orm_1.eq)(index_js_1.payments.orderId, paymentIdOrReceipt));
        let [paymentRecord] = await database_js_1.db
            .select()
            .from(index_js_1.payments)
            .where(whereClause)
            .limit(1);
        if (!paymentRecord)
            throw new AppError_js_1.NotFoundError("Invoice not found");
        const [tenant] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, paymentRecord.tenantId)).limit(1);
        const invoiceId = paymentRecord.receiptNumber || paymentRecord.orderId || paymentRecord.id;
        const companyName = tenant?.name || "Corporate Customer";
        const amount = Number(paymentRecord.amount);
        const status = paymentRecord.status === "CAPTURED" || paymentRecord.status === "PAID" ? "Paid" : paymentRecord.status;
        return {
            id: invoiceId,
            invoiceNumber: invoiceId,
            company: companyName,
            tenantId: paymentRecord.tenantId,
            plan: "Enterprise Annual",
            date: paymentRecord.createdAt.toISOString().split("T")[0],
            amount: amount,
            currency: paymentRecord.currency || "USD",
            status: status,
            customer: {
                name: companyName,
                id: tenant?.id,
            },
            paymentMethod: paymentRecord.method || "Razorpay / Bank Transfer",
            orderId: paymentRecord.orderId,
            paymentId: paymentRecord.paymentId,
            razorpayPaymentId: paymentRecord.paymentId || paymentRecord.orderId || "N/A",
            issuer: {
                company: "MaintenX OS Global Cloud Technologies Inc.",
                gstin: "23AABCM1234F1Z8",
                support: "billing@maintenx.com",
            },
        };
    }
    // =========================================================================
    // 7. MODULES & FEATURES
    // =========================================================================
    async getCompanyModules(companyId) {
        const [tenant] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, companyId)).limit(1);
        if (!tenant)
            throw new AppError_js_1.NotFoundError("Company not found");
        const [sub] = await database_js_1.db.select().from(index_js_1.subscriptions).where((0, drizzle_orm_1.eq)(index_js_1.subscriptions.tenantId, companyId)).limit(1);
        const subPlanName = sub?.planName || tenant.plan || "Plant Pilot";
        const planKey = (subPlanName || "").toLowerCase().trim();
        const CANONICAL_PLAN_MODULES = {
            "plant pilot": ["produce"],
            "plant-pilot": ["produce"],
            "trial": ["produce"],
            "starter": ["produce", "verify"],
            "individual modules": ["produce", "verify"],
            "individual-modules": ["produce", "verify"],
            "bundles": ["plan", "produce", "verify", "maintain", "move"],
            "advanced": ["plan", "produce", "verify", "maintain", "move"],
            "maintenx os complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "maintenx-complete": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "enterprise": ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
            "custom": ["produce"],
            "custom ": ["produce"],
        };
        const allowedMods = CANONICAL_PLAN_MODULES[planKey] || (tenant.plan?.toUpperCase() === "ENTERPRISE" ? ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"] : ["produce"]);
        const modules = await database_js_1.db.select().from(index_js_1.tenantModules).where((0, drizzle_orm_1.eq)(index_js_1.tenantModules.tenantId, companyId));
        const modulesMap = {
            plan: allowedMods.includes("plan"),
            produce: allowedMods.includes("produce"),
            verify: allowedMods.includes("verify"),
            maintain: allowedMods.includes("maintain"),
            move: allowedMods.includes("move"),
            people: allowedMods.includes("people"),
            improve: allowedMods.includes("improve"),
            intelligence: allowedMods.includes("intelligence"),
        };
        for (const m of modules) {
            modulesMap[m.moduleKey] = m.isEnabled;
        }
        return modulesMap;
    }
    async toggleCompanyModule(companyId, moduleKey, isEnabled, actor) {
        const [tenant] = await database_js_1.db.select().from(index_js_1.tenants).where((0, drizzle_orm_1.eq)(index_js_1.tenants.id, companyId)).limit(1);
        if (!tenant)
            throw new AppError_js_1.NotFoundError("Company not found");
        const [existing] = await database_js_1.db
            .select()
            .from(index_js_1.tenantModules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_1.tenantModules.tenantId, companyId), (0, drizzle_orm_1.eq)(index_js_1.tenantModules.moduleKey, moduleKey)))
            .limit(1);
        const newState = isEnabled !== undefined ? isEnabled : existing ? !existing.isEnabled : false;
        if (existing) {
            await database_js_1.db
                .update(index_js_1.tenantModules)
                .set({ isEnabled: newState, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(index_js_1.tenantModules.id, existing.id));
        }
        else {
            await database_js_1.db.insert(index_js_1.tenantModules).values({
                tenantId: companyId,
                moduleKey,
                isEnabled: newState,
            });
        }
        await this.writeAudit({
            actor,
            action: "MODULE_ENTITLEMENT_TOGGLED",
            entityType: "TenantModule",
            entityId: `${companyId}:${moduleKey}`,
            tenantId: companyId,
            newValues: { moduleKey, isEnabled: newState },
        });
        return { companyId, moduleKey, isEnabled: newState };
    }
    // =========================================================================
    // 8. GLOBAL PLATFORM USERS
    // =========================================================================
    async getPlatformUsers(query) {
        const allUsers = await database_js_1.db.select().from(index_js_1.users).orderBy((0, drizzle_orm_1.desc)(index_js_1.users.createdAt));
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants);
        const tenantMap = new Map(allTenants.map((t) => [t.id, t.name]));
        const allRoles = await database_js_1.db.select().from(index_js_1.roles);
        const roleMap = new Map(allRoles.map((r) => [r.id, r.name]));
        const allUserRoles = await database_js_1.db.select().from(index_js_1.userRoles);
        const userRoleMap = new Map();
        for (const ur of allUserRoles) {
            if (!userRoleMap.has(ur.userId)) {
                userRoleMap.set(ur.userId, roleMap.get(ur.roleId) || "Operator");
            }
        }
        let results = allUsers.map((u) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            company: tenantMap.get(u.tenantId) || "Platform Enterprise",
            tenantId: u.tenantId,
            role: u.isMasterAdmin ? "Master Admin" : userRoleMap.get(u.id) || "Company Admin",
            status: u.status === "ACTIVE" ? "Active" : "Suspended",
            lastLogin: u.lastLoginAt ? u.lastLoginAt.toISOString().replace("T", " ").substring(0, 16) : "Never",
            createdAt: u.createdAt.toISOString().split("T")[0],
        }));
        if (query?.search) {
            const q = query.search.toLowerCase();
            results = results.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
        }
        if (query?.status && query.status !== "All") {
            results = results.filter((u) => u.status.toLowerCase() === query.status.toLowerCase());
        }
        return results;
    }
    async updateUserStatus(userId, newStatus, actor) {
        const [user] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, userId)).limit(1);
        if (!user)
            throw new AppError_js_1.NotFoundError("User not found");
        const normalized = newStatus.toUpperCase() === "ACTIVE" ? "ACTIVE" : "SUSPENDED";
        await database_js_1.db.update(index_js_1.users).set({ status: normalized, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(index_js_1.users.id, userId));
        await this.writeAudit({
            actor,
            action: "USER_STATUS_UPDATED",
            entityType: "User",
            entityId: userId,
            tenantId: user.tenantId,
            oldValues: { status: user.status },
            newValues: { status: normalized },
        });
        return { id: userId, status: normalized === "ACTIVE" ? "Active" : "Suspended" };
    }
    async deleteUser(userId, actor) {
        const [user] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, userId)).limit(1);
        if (!user)
            throw new AppError_js_1.NotFoundError("User not found");
        await this.writeAudit({
            actor,
            action: "USER_DELETED",
            entityType: "User",
            entityId: userId,
            tenantId: user.tenantId,
            oldValues: { email: user.email, status: user.status },
            newValues: { deleted: true },
        });
        await database_js_1.db.delete(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, userId));
        return { success: true, message: `User '${user.email}' deleted successfully.` };
    }
    // =========================================================================
    // 9. PLATFORM ANALYTICS
    // =========================================================================
    async getPlatformAnalytics() {
        const allTenants = await database_js_1.db.select().from(index_js_1.tenants);
        const allUsers = await database_js_1.db.select().from(index_js_1.users);
        const activeUsers = allUsers.filter((u) => u.status === "ACTIVE").length;
        // Subscription Distribution
        const subDist = {};
        for (const t of allTenants) {
            const p = t.plan || "Enterprise";
            subDist[p] = (subDist[p] || 0) + 1;
        }
        // Module Adoption Rate
        const allModules = await database_js_1.db.select().from(index_js_1.tenantModules);
        const moduleAdoptionCounts = {
            plan: 0,
            produce: 0,
            verify: 0,
            maintain: 0,
            move: 0,
            people: 0,
            improve: 0,
            intelligence: 0,
        };
        for (const m of allModules) {
            if (m.isEnabled && moduleAdoptionCounts[m.moduleKey] !== undefined) {
                moduleAdoptionCounts[m.moduleKey]++;
            }
        }
        // Recent telemetry count
        const telemetryResult = await database_js_1.pool.query("SELECT COUNT(*) as count FROM machine_telemetry");
        const telemetryCount = parseInt(telemetryResult.rows[0]?.count || "0", 10);
        return {
            totalCompanies: allTenants.length,
            totalUsers: allUsers.length,
            activeUsers,
            avgSession: "N/A (Requires Active Session Telemetry Ingest)",
            apiRequests: telemetryCount > 0 ? `${telemetryCount} Telemetry Ingests` : "N/A (Audit Logs Available)",
            subscriptionDistribution: subDist,
            moduleAdoption: moduleAdoptionCounts,
        };
    }
    // =========================================================================
    // 10. ACTIVITY & AUDIT LOGS
    // =========================================================================
    async getAuditLogs(query) {
        const logs = await database_js_1.db.select().from(index_js_1.auditLogs).orderBy((0, drizzle_orm_1.desc)(index_js_1.auditLogs.createdAt)).limit(100);
        const allUsers = await database_js_1.db.select().from(index_js_1.users);
        const userMap = new Map(allUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
        let results = logs.map((l) => ({
            id: l.id,
            user: l.userId ? userMap.get(l.userId) || "Master Admin" : "System / Master Admin",
            event: l.action,
            target: `${l.entityType} (${l.entityId})`,
            date: l.createdAt.toISOString().replace("T", " ").substring(0, 19),
            ip: l.ipAddress || "127.0.0.1",
        }));
        if (query?.search) {
            const q = query.search.toLowerCase();
            results = results.filter((l) => l.user.toLowerCase().includes(q) || l.target.toLowerCase().includes(q) || l.event.toLowerCase().includes(q));
        }
        if (query?.event && query.event !== "All") {
            results = results.filter((l) => l.event === query.event);
        }
        return results;
    }
    async deleteAuditLog(id, actor) {
        const [log] = await database_js_1.db.select().from(index_js_1.auditLogs).where((0, drizzle_orm_1.eq)(index_js_1.auditLogs.id, id)).limit(1);
        if (!log)
            throw new AppError_js_1.NotFoundError("Audit log record not found");
        await database_js_1.db.delete(index_js_1.auditLogs).where((0, drizzle_orm_1.eq)(index_js_1.auditLogs.id, id));
        return { success: true, message: `Audit log ${id} deleted successfully` };
    }
    async clearAllAuditLogs() {
        await database_js_1.db.delete(index_js_1.auditLogs);
        return { success: true, message: "All audit logs cleared successfully" };
    }
    // =========================================================================
    // 11. SUPPORT TICKETS
    // =========================================================================
    async getSupportTickets(query) {
        const tickets = await database_js_1.db.select().from(index_js_1.supportTickets).orderBy((0, drizzle_orm_1.desc)(index_js_1.supportTickets.createdAt));
        let results = tickets.map((t) => ({
            id: t.id,
            company: t.companyName,
            tenantId: t.tenantId,
            subject: t.subject,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assignedTo: t.assignedTo,
            date: t.createdAt.toISOString().replace("T", " ").substring(0, 16),
            resolution: t.resolution,
        }));
        if (query?.search) {
            const q = query.search.toLowerCase();
            results = results.filter((t) => t.company.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
        }
        if (query?.status && query.status !== "All") {
            results = results.filter((t) => t.status.toLowerCase() === query.status.toLowerCase());
        }
        return results;
    }
    async createSupportTicket(input, actor) {
        if (!input.companyName || !input.subject) {
            throw new AppError_js_1.ValidationError("Company name and subject are required");
        }
        const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        const [ticket] = await database_js_1.db
            .insert(index_js_1.supportTickets)
            .values({
            id: ticketId,
            companyName: input.companyName,
            tenantId: input.tenantId,
            subject: input.subject,
            description: input.description || null,
            priority: input.priority || "Medium",
            status: "Open",
        })
            .returning();
        await this.writeAudit({
            actor,
            action: "SUPPORT_TICKET_CREATED",
            entityType: "SupportTicket",
            entityId: ticket.id,
            tenantId: input.tenantId,
            newValues: input,
        });
        return ticket;
    }
    async updateTicketStatus(id, status, resolution, actor) {
        const [ticket] = await database_js_1.db.select().from(index_js_1.supportTickets).where((0, drizzle_orm_1.eq)(index_js_1.supportTickets.id, id)).limit(1);
        if (!ticket)
            throw new AppError_js_1.NotFoundError("Ticket not found");
        const patch = { status, updatedAt: new Date() };
        if (resolution)
            patch.resolution = resolution;
        await database_js_1.db.update(index_js_1.supportTickets).set(patch).where((0, drizzle_orm_1.eq)(index_js_1.supportTickets.id, id));
        await this.writeAudit({
            actor,
            action: "SUPPORT_TICKET_UPDATED",
            entityType: "SupportTicket",
            entityId: id,
            tenantId: ticket.tenantId,
            oldValues: { status: ticket.status },
            newValues: patch,
        });
        return { id, status, resolution };
    }
    async deleteSupportTicket(id, actor) {
        const [ticket] = await database_js_1.db.select().from(index_js_1.supportTickets).where((0, drizzle_orm_1.eq)(index_js_1.supportTickets.id, id)).limit(1);
        if (!ticket)
            throw new AppError_js_1.NotFoundError("Ticket not found");
        await this.writeAudit({
            actor,
            action: "SUPPORT_TICKET_DELETED",
            entityType: "SupportTicket",
            entityId: id,
            tenantId: ticket.tenantId,
            oldValues: { id: ticket.id, subject: ticket.subject, status: ticket.status },
            newValues: { deleted: true },
        });
        await database_js_1.db.delete(index_js_1.supportTickets).where((0, drizzle_orm_1.eq)(index_js_1.supportTickets.id, id));
        return { success: true, message: `Ticket ${id} deleted successfully.` };
    }
    // =========================================================================
    // 12. PLATFORM SETTINGS
    // =========================================================================
    async getPlatformSettings() {
        let [settings] = await database_js_1.db.select().from(index_js_1.platformSettings).where((0, drizzle_orm_1.eq)(index_js_1.platformSettings.id, "global")).limit(1);
        if (!settings) {
            [settings] = await database_js_1.db
                .insert(index_js_1.platformSettings)
                .values({
                id: "global",
                platformName: "MaintenX-OS",
                supportEmail: "support@maintenx.com",
            })
                .returning();
        }
        return settings;
    }
    async updatePlatformSettings(input, actor) {
        const [existing] = await database_js_1.db.select().from(index_js_1.platformSettings).where((0, drizzle_orm_1.eq)(index_js_1.platformSettings.id, "global")).limit(1);
        const patch = { updatedAt: new Date() };
        if (input.platformName !== undefined)
            patch.platformName = input.platformName;
        if (input.supportEmail !== undefined)
            patch.supportEmail = input.supportEmail;
        if (input.require2fa !== undefined)
            patch.require2fa = Boolean(input.require2fa);
        if (input.enforceStrongPasswords !== undefined)
            patch.enforceStrongPasswords = Boolean(input.enforceStrongPasswords);
        if (input.logAllIps !== undefined)
            patch.logAllIps = Boolean(input.logAllIps);
        if (input.maintenanceMode !== undefined)
            patch.maintenanceMode = Boolean(input.maintenanceMode);
        if (input.maintenanceMessage !== undefined)
            patch.maintenanceMessage = input.maintenanceMessage;
        if (input.defaultCurrency !== undefined)
            patch.defaultCurrency = input.defaultCurrency;
        if (input.smtpConfig)
            patch.smtpConfig = input.smtpConfig;
        if (input.branding)
            patch.branding = input.branding;
        const [updated] = await database_js_1.db
            .update(index_js_1.platformSettings)
            .set(patch)
            .where((0, drizzle_orm_1.eq)(index_js_1.platformSettings.id, "global"))
            .returning();
        await this.writeAudit({
            actor,
            action: "PLATFORM_SETTINGS_UPDATED",
            entityType: "PlatformSettings",
            entityId: "global",
            oldValues: existing,
            newValues: patch,
        });
        return updated;
    }
}
exports.MasterAdminService = MasterAdminService;
exports.masterAdminService = new MasterAdminService();
