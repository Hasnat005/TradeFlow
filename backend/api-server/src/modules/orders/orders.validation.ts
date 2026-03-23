import { z } from 'zod';

const orderItemSchema = z.object({
  itemName: z.string().min(1).optional(),
  item_name: z.string().min(1).optional(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().positive().optional(),
  unit_price: z.coerce.number().positive().optional(),
}).superRefine((value, ctx) => {
  if (!value.itemName && !value.item_name) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'itemName or item_name is required' });
  }

  if (value.unitPrice === undefined && value.unit_price === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'unitPrice or unit_price is required' });
  }
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
  supplierName: z.string().min(2).optional(),
  supplier_name: z.string().min(2).optional(),
  expectedDeliveryDate: z.string().min(1).optional(),
  expected_delivery_date: z.string().min(1).optional(),
  total_amount: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
  status: orderStatusSchema.default('Draft'),
  items: z.array(orderItemSchema).min(1),
}).superRefine((value, ctx) => {
  if (!value.supplierName && !value.supplier_name) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'supplierName or supplier_name is required' });
  }

  if (!value.expectedDeliveryDate && !value.expected_delivery_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'expectedDeliveryDate or expected_delivery_date is required' });
  }
});

export const orderListQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const orderIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateOrderBodySchema = z.object({
  supplierName: z.string().min(2).optional(),
  supplier_name: z.string().min(2).optional(),
  expectedDeliveryDate: z.string().min(1).optional(),
  expected_delivery_date: z.string().min(1).optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1).optional(),
});

export const updateOrderStatusBodySchema = z.object({
  status: orderStatusSchema,
});

export const convertOrderToInvoiceBodySchema = z.object({
  orderId: z.string().uuid(),
});
