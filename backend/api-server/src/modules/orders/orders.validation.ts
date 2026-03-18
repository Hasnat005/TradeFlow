import { z } from 'zod';

const orderItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().positive(),
});

export const orderStatusSchema = z.enum([
  'Draft',
  'Sent',
  'Accepted',
  'Rejected',
  'Delivered',
  'Completed',
]);

export const createOrderBodySchema = z.object({
  supplierName: z.string().min(2),
  expectedDeliveryDate: z.string().min(1),
  notes: z.string().optional(),
  status: orderStatusSchema.default('Draft'),
  items: z.array(orderItemSchema).min(1),
});

export const orderListQuerySchema = z.object({
  status: orderStatusSchema.optional(),
});

export const orderIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateOrderBodySchema = z.object({
  supplierName: z.string().min(2).optional(),
  expectedDeliveryDate: z.string().min(1).optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1).optional(),
});

export const updateOrderStatusBodySchema = z.object({
  status: orderStatusSchema,
});
