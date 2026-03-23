import { z } from 'zod';

export const financingStatusSchema = z.enum([
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Disbursed',
  'Repaid',
]);

export const createFinancingRequestBodySchema = z
  .object({
    invoiceId: z.string().min(1).optional(),
    invoice_id: z.string().min(1).optional(),
    requestedAmount: z.coerce.number().positive().optional(),
    requested_amount: z.coerce.number().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.invoiceId && !value.invoice_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'invoiceId or invoice_id is required' });
    }

    if (value.requestedAmount === undefined && value.requested_amount === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'requestedAmount or requested_amount is required' });
    }
  });

export const financingListQuerySchema = z.object({
  status: financingStatusSchema.optional(),
  search: z.string().optional(),
});

export const financingInvoicesQuerySchema = z.object({
  search: z.string().optional(),
});

export const financingIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateFinancingStatusBodySchema = z.object({
  status: financingStatusSchema,
});
