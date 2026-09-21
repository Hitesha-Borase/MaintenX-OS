import { z } from "zod";

export const createSkuSchema = z.object({
  name: z.string({ required_error: "SKU name is required" }).min(2, "SKU name must be at least 2 characters"),
  skuCode: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  category: z.string().default("FINISHED_GOODS").optional(),
  familyId: z.string().optional(),
  uom: z.string().default("Units").optional(),
  barcode: z.string().optional(),
  standardCost: z.coerce.number().default(0).optional(),
  shelfLifeDays: z.coerce.number().default(365).optional(),
  minStockLevel: z.coerce.number().default(1000).optional(),
  maxStockLevel: z.coerce.number().default(50000).optional(),
}).passthrough();

export type CreateSkuInput = z.infer<typeof createSkuSchema>;

export const createPlantSchema = z.object({
  name: z.string({ required_error: "Plant name is required" }).min(2, "Plant name must be at least 2 characters"),
  code: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
}).passthrough();

export type CreatePlantInput = z.infer<typeof createPlantSchema>;

export const createDepartmentSchema = z.object({
  name: z.string({ required_error: "Department name is required" }).min(2, "Department name must be at least 2 characters"),
  code: z.string().optional(),
  plantId: z.string().optional(),
}).passthrough();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const createBomSchema = z.object({
  skuId: z.string().uuid(),
  version: z.string().default("v1.0"),
  name: z.string().min(2),
  batchSize: z.coerce.number().default(10000),
  batchUom: z.string().default("Units"),
  yieldPercent: z.coerce.number().default(98.5),
  items: z.array(
    z.object({
      componentSkuId: z.string().uuid(),
      quantity: z.coerce.number().positive(),
      uom: z.string(),
      scrapPercentage: z.coerce.number().default(0),
      stage: z.string().default("MIXING"),
    })
  ),
});

export type CreateBomInput = z.infer<typeof createBomSchema>;

export const routingStepSchema = z.object({
  sequence: z.coerce.number().default(10),
  operationCode: z.string().min(1),
  operationName: z.string().min(1),
  workCenterId: z.string().uuid().optional().nullable(),
  stdDurationMin: z.coerce.number().default(15),
  setupDurationMin: z.coerce.number().default(10),
  crewSize: z.coerce.number().default(2),
  isQualityGate: z.boolean().default(false),
  instructions: z.string().optional().nullable(),
});

export const createRoutingSchema = z.object({
  routingCode: z.string().optional().nullable(),
  skuId: z.string().optional().nullable(),
  lineId: z.string().optional().nullable(),
  plantId: z.string().optional().nullable(),
  revision: z.string().default("R1"),
  approvalStatus: z.string().default("Approved"),
  status: z.string().default("Active"),
  stdRunRateBph: z.coerce.number().default(12000),
  setupDurationMin: z.coerce.number().default(45),
  expectedYieldPct: z.coerce.number().default(98.50),
  effectiveFrom: z.string().optional().nullable(),
  effectiveTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  steps: z.array(routingStepSchema).optional().default([]),
});

export const updateRoutingSchema = createRoutingSchema.partial();

export type CreateRoutingInput = z.infer<typeof createRoutingSchema>;
export type UpdateRoutingInput = z.infer<typeof updateRoutingSchema>;
export type RoutingStepInput = z.infer<typeof routingStepSchema>;

