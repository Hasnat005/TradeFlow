import { z } from 'zod';

export const invoiceStatusSchema = z.enum(['Draft', 'Sent', 'Financed', 'Paid', 'Overdue']);

const invoiceItemSchema = z
  .object({
    itemName: z.string().min(1).optional(),
    item_name: z.string().min(1).optional(),
    quantity: z.coerce.number().positive(),
    unitPrice: z.coerce.number().positive().optional(),
    unit_price: z.coerce.number().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.itemName && !value.item_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'itemName or item_name is required' });
    }

    if (value.unitPrice === undefined && value.unit_price === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'unitPrice or unit_price is required' });
    }
  });

export const createInvoiceBodySchema = z
  .object({
    buyerName: z.string().min(2).optional(),
    buyer_name: z.string().min(2).optional(),
    purchaseOrderId: z.string().uuid().optional(),
    purchase_order_id: z.string().uuid().optional(),
    items: z.array(invoiceItemSchema).min(1),
    totalAmount: z.coerce.number().positive().optional(),
    total_amount: z.coerce.number().positive().optional(),
    dueDate: z.string().min(1).optional(),
    due_date: z.string().min(1).optional(),
    status: z.enum(['Draft', 'Sent']).optional().default('Draft'),
  })
  .superRefine((value, ctx) => {
    if (!value.buyerName && !value.buyer_name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'buyerName or buyer_name is required' });
    }

    if (value.totalAmount === undefined && value.total_amount === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'totalAmount or total_amount is required' });
    }

    if (!value.dueDate && !value.due_date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dueDate or due_date is required' });
    }
  });

export const invoiceListQuerySchema = z.object({
  status: invoiceStatusSchema.optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const invoiceIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateInvoiceStatusBodySchema = z.object({
  status: invoiceStatusSchema,
  paymentAmount: z.coerce.number().positive().optional(),
  payment_amount: z.coerce.number().positive().optional(),
});

export const createInvoiceFromOrderBodySchema = z
  .object({
    orderId: z.string().uuid().optional(),
    order_id: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.orderId && !value.order_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'orderId or order_id is required' });
    }
  });
