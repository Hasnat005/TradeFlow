import { z } from 'zod';

export const updateProfileBodySchema = z.object({
  companyName: z.string().min(2).optional(),
  businessType: z.enum(['Supplier', 'Distributor', 'Exporter']).optional(),
  address: z.string().min(3).optional(),
  taxId: z.string().min(3).optional(),
  industryType: z.string().min(2).optional(),
  phoneNumber: z.string().min(6).optional(),
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

export const addBankBodySchema = z.object({
  bankName: z.string().min(2),
  accountNumber: z.string().min(8),
});
