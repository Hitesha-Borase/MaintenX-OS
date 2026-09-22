"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.digitalSignOffSchema = exports.tenantRegistrationSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Please provide a valid work email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    plantId: zod_1.z.string().uuid().optional(),
});
exports.tenantRegistrationSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, "Company name must be at least 2 characters").optional(),
    company: zod_1.z.string().min(2).optional(),
    companyName: zod_1.z.string().min(2).optional(),
    admin: zod_1.z.string().min(2, "Administrator name must be at least 2 characters").optional(),
    adminName: zod_1.z.string().min(2).optional(),
    ownerName: zod_1.z.string().min(2).optional(),
    fullName: zod_1.z.string().min(2).optional(),
    adminEmail: zod_1.z.string().email("Please provide a valid corporate email").optional(),
    email: zod_1.z.string().email("Please provide a valid corporate email").optional(),
    adminPhone: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    subscription: zod_1.z.string().default("Plant Pilot").optional(),
    plan: zod_1.z.string().optional(),
})
    .refine((data) => Boolean(data.name || data.company || data.companyName), {
    message: "Company name is required and must be at least 2 characters",
    path: ["companyName"],
})
    .refine((data) => Boolean(data.admin || data.adminName || data.ownerName || data.fullName), {
    message: "Administrator full name is required and must be at least 2 characters",
    path: ["adminName"],
})
    .refine((data) => Boolean(data.adminEmail || data.email), {
    message: "Corporate email is required",
    path: ["email"],
});
exports.digitalSignOffSchema = zod_1.z.object({
    pin: zod_1.z.string().min(4, "4-digit signature PIN required"),
    entityType: zod_1.z.string().default("General"),
    entityId: zod_1.z.string().default("system"),
    meaning: zod_1.z.string().default("DIGITAL_SIGN_OFF"),
    comments: zod_1.z.string().optional(),
});
