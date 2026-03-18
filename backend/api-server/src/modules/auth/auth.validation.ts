import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must include at least one letter')
  .regex(/[0-9]/, 'Password must include at least one number');

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().optional(),
);

const businessTypeSchema = z.enum(['Supplier', 'Buyer / Distributor', 'Exporter']);

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const signupBodySchema = z.object({
  companyName: z.string().min(2),
  businessType: businessTypeSchema.optional(),
  email: z.string().email(),
  password: passwordSchema,
  phone: optionalTrimmedString,
  address: optionalTrimmedString,
});

export const registerBodySchema = z.object({
  company_name: z.string().min(2),
  business_type: businessTypeSchema,
  email: z.string().email(),
  password: passwordSchema,
  phone: optionalTrimmedString,
  address: optionalTrimmedString,
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});
