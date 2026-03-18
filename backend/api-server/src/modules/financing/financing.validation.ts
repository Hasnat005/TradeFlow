import { z } from 'zod';

export const financingStatusSchema = z.enum([
  'Pending',
  'Approved',
  'Rejected',
  'Disbursed',
  'Repaid',
]);

export const createFinancingRequestBodySchema = z
  .object({
    invoiceId: z.string().min(1),
    requestedAmount: z.coerce.number().positive(),
    invoiceAmount: z.coerce.number().positive(),
  })
  .refine((value) => value.requestedAmount <= value.invoiceAmount, {
    message: 'requestedAmount cannot exceed invoiceAmount',
    path: ['requestedAmount'],
  });

export const financingListQuerySchema = z.object({
  status: financingStatusSchema.optional(),
});

export const financingIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateFinancingStatusBodySchema = z.object({
  status: financingStatusSchema,
});
