import { FastifyReply, FastifyRequest } from "fastify";
import { billingService } from "./billing.service.js";
import { formatSuccess } from "../../shared/utils/responseFormatter.js";
import { ValidationError } from "../../shared/errors/AppError.js";
import { createOrderSchema, verifyPaymentSchema, upgradePlanSchema } from "./billing.schema.js";

export class BillingController {
  async getPlans(_request: FastifyRequest, reply: FastifyReply) {
    const plans = await billingService.listPlans();
    return reply.send(formatSuccess(plans));
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    const input = createOrderSchema.parse(request.body);
    const planId = input.planId;
    const currency = input.currency || "INR";
    const tenantId = (request.user as any)?.tenantId || "aa3183d2-709b-42a8-add1-b2e4b2d873b0";

    const order = await billingService.createOrder({ planId, tenantId, currency });
    return reply.send(formatSuccess(order, "Razorpay payment order created successfully"));
  }

  async verifyPayment(request: FastifyRequest, reply: FastifyReply) {
    const input = verifyPaymentSchema.parse(request.body);
    const tenantId = (request.user as any)?.tenantId || "aa3183d2-709b-42a8-add1-b2e4b2d873b0";

    const result = await billingService.verifyPayment({
      tenantId,
      orderId: input.orderId,
      paymentId: input.paymentId,
      signature: input.signature,
      planId: input.planId || "standard",
    });

    return reply.send(formatSuccess(result, "Payment successfully verified"));
  }

  async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const signature = (request.headers["x-razorpay-signature"] as string) || "";
    const rawBody = typeof request.body === "string" ? request.body : JSON.stringify(request.body || {});
    const payload = typeof request.body === "object" ? request.body : JSON.parse(rawBody || "{}");

    const result = await billingService.processWebhook(rawBody, signature, payload);
    return reply.send(formatSuccess(result));
  }

  async upgradePlan(request: FastifyRequest, reply: FastifyReply) {
    const input = upgradePlanSchema.parse(request.body);
    const tenantId = (request.user as any)?.tenantId;

    if (!tenantId) {
      throw new ValidationError("No tenant associated with user session.");
    }

    const result = await billingService.upgradePlan({ tenantId, planId: input.planId });
    return reply.send(formatSuccess(result, "Subscription plan upgraded successfully"));
  }

  async getSubscription(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request.user as any)?.tenantId || "aa3183d2-709b-42a8-add1-b2e4b2d873b0";
    const subscription = await billingService.getSubscription(tenantId);
    return reply.send(formatSuccess(subscription));
  }
}

export const billingController = new BillingController();
