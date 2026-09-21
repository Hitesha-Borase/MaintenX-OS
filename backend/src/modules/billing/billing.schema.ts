import { z } from "zod";

export const createOrderSchema = z.object({
  planId: z.string({ required_error: "Subscription plan ID is required" }).min(1, "Plan ID cannot be empty"),
  currency: z.string().min(3, "Currency must be a 3 or 4 letter ISO code").max(4).default("INR").optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string({ required_error: "Order ID is required" }).min(1, "Order ID cannot be empty"),
  paymentId: z.string({ required_error: "Payment ID is required" }).min(1, "Payment ID cannot be empty"),
  signature: z.string({ required_error: "Payment signature is required" }).min(1, "Payment signature cannot be empty"),
  planId: z.string().optional().default("standard"),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const upgradePlanSchema = z.object({
  planId: z.string({ required_error: "Target plan ID is required" }).min(1, "Target plan ID cannot be empty"),
});

export type UpgradePlanInput = z.infer<typeof upgradePlanSchema>;
