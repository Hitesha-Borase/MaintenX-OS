import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid work email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  plantId: z.string().uuid().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const tenantRegistrationSchema = z
  .object({
    name: z.string().min(2, "Company name must be at least 2 characters").optional(),
    company: z.string().min(2).optional(),
    companyName: z.string().min(2).optional(),
    admin: z.string().min(2, "Administrator name must be at least 2 characters").optional(),
    adminName: z.string().min(2).optional(),
    ownerName: z.string().min(2).optional(),
    fullName: z.string().min(2).optional(),
    adminEmail: z.string().email("Please provide a valid corporate email").optional(),
    email: z.string().email("Please provide a valid corporate email").optional(),
    adminPhone: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    subscription: z.string().default("Plant Pilot").optional(),
    plan: z.string().optional(),
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

export type TenantRegistrationInput = z.infer<typeof tenantRegistrationSchema>;

export const digitalSignOffSchema = z.object({
  pin: z.string().min(4, "4-digit signature PIN required"),
  entityType: z.string().default("General"),
  entityId: z.string().default("system"),
  meaning: z.string().default("DIGITAL_SIGN_OFF"),
  comments: z.string().optional(),
});

export type DigitalSignOffInput = z.infer<typeof digitalSignOffSchema>;
