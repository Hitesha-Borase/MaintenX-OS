import { z } from "zod";

export const provisionUserSchema = z.object({
  name: z.string({ required_error: "User name is required" }).min(2, "Name must be at least 2 characters"),
  email: z.string({ required_error: "Email is required" }).email("Please provide a valid email address"),
  role: z.string({ required_error: "Role is required" }).min(2, "Role cannot be empty"),
  department: z.string().optional(),
  plant: z.string().optional(),
  plantId: z.string().optional(),
  status: z.string().default("ACTIVE").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export type ProvisionUserInput = z.infer<typeof provisionUserSchema>;

export const updateUserStatusSchema = z.object({
  status: z.string({ required_error: "Status is required" }).min(2, "Status cannot be empty"),
});

export const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Valid email is required").optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  plant: z.string().optional(),
  plantId: z.string().optional(),
  status: z.string().optional(),
  phone: z.string().optional(),
});

export const bulkUpdateUserStatusSchema = z.object({
  action: z.string({ required_error: "Bulk action is required" }).min(2),
});

export const createInvitationSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Valid email is required"),
  role: z.string({ required_error: "Role is required" }).min(2, "Role cannot be empty"),
  department: z.string().optional(),
  plantId: z.string().optional(),
});

export const updateInvitationSchema = createInvitationSchema.partial();

export const createRoleSchema = z.object({
  name: z.string({ required_error: "Role name is required" }).min(2, "Role name must be at least 2 characters"),
  code: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const createApprovalRuleSchema = z.object({
  event: z.string({ required_error: "Event trigger is required" }).min(2, "Event trigger must be at least 2 characters"),
  tier: z.string({ required_error: "Approval tier is required" }).min(2, "Tier is required"),
  authorizedRoles: z.string({ required_error: "Authorized roles are required" }).min(2, "Authorized roles cannot be empty"),
  compliance: z.string().optional(),
  description: z.string().optional(),
});

export const updateApprovalRuleSchema = createApprovalRuleSchema.partial();

export const createApiKeySchema = z.object({
  name: z.string({ required_error: "API key name is required" }).min(2, "Name must be at least 2 characters"),
  scope: z.string().optional(),
  expiresInDays: z.coerce.number().optional(),
});

export const createIoTGatewaySchema = z.object({
  name: z.string({ required_error: "Gateway name is required" }).min(2),
  ipAddress: z.string().optional(),
  protocol: z.string().optional(),
  plantId: z.string().optional(),
});
