import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string({ required_error: "Company name is required" }).min(2, "Company name must be at least 2 characters"),
  admin: z.string({ required_error: "Administrator name is required" }).min(2, "Administrator name must be at least 2 characters"),
  adminEmail: z.string({ required_error: "Administrator email is required" }).email("Please provide a valid corporate email"),
  adminPhone: z.string().optional().default(""),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
  subscription: z.string().default("Plant Pilot").optional(),
  currency: z.string().default("CAD").optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").optional(),
  subscription: z.string().min(2, "Subscription plan name must be at least 2 characters").optional(),
  adminName: z.string().min(2, "Administrator name must be at least 2 characters").optional(),
  adminEmail: z.string().email("Please provide a valid email").optional(),
  adminPhone: z.string().optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const updateCompanyStatusSchema = z.object({
  status: z.string({ required_error: "Status is required" }).min(2, "Status cannot be empty"),
});

export const toggleCompanyModuleSchema = z.object({
  isEnabled: z.boolean().optional(),
});

export const createPlanSchema = z.object({
  id: z.string({ required_error: "Plan ID is required" }).min(2, "Plan ID must be at least 2 characters"),
  name: z.string({ required_error: "Plan name is required" }).min(2, "Plan name must be at least 2 characters"),
  subtitle: z.string().optional(),
  priceMonthly: z.coerce.number().min(0, "Monthly price must be 0 or positive"),
  priceAnnual: z.coerce.number().min(0).optional(),
  currency: z.string().default("CAD").optional(),
  duration: z.string().default("Unlimited").optional(),
  userLimit: z.union([z.number(), z.string()]).default(10).optional(),
  accessLevel: z.string().default("Standard").optional(),
  status: z.string().default("Active").optional(),
  isPopular: z.boolean().default(false).optional(),
  ctaText: z.string().optional(),
  modules: z.union([z.array(z.string()), z.string()]).default(["produce"]),
  features: z.union([z.array(z.string()), z.string()]).default([]),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial().omit({ id: true });

export const updatePlanStatusSchema = z.object({
  status: z.string({ required_error: "Status is required" }).min(2),
});

export const createCompanyAdminSchema = z.object({
  name: z.string({ required_error: "Admin name is required" }).min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  company: z.string().optional(),
  companyId: z.string().optional(),
});

export type CreateCompanyAdminInput = z.infer<typeof createCompanyAdminSchema>;

export const updateCompanyAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  status: z.string().optional(),
});

export const updateAdminStatusSchema = z.object({
  status: z.string({ required_error: "Status is required" }).min(2, "Status cannot be empty"),
});

export const updateTicketStatusSchema = z.object({
  status: z.string({ required_error: "Status is required" }).min(2, "Status cannot be empty"),
  resolution: z.string().optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.string({ required_error: "Status is required" }).min(2, "Status cannot be empty"),
});

export const createSupportTicketSchema = z.object({
  subject: z.string({ required_error: "Ticket subject is required" }).min(3, "Subject must be at least 3 characters"),
  message: z.string({ required_error: "Ticket message is required" }).min(5, "Message must be at least 5 characters"),
  priority: z.string().default("MEDIUM").optional(),
  category: z.string().default("General").optional(),
  companyId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
