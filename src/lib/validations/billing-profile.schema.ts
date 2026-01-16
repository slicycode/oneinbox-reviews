import { z } from 'zod'

export const billingProfileSchema = z
  .object({
    country: z.string().trim().min(1, 'Country is required'),
    state: z.string().trim().min(1, 'State is required'),
    city: z.string().trim().min(1, 'City is required'),
    street: z.string().trim().min(1, 'Street address is required'),
    zipcode: z.string().trim().min(1, 'Postal code is required'),
    isBusinessCustomer: z.boolean().default(false),
    taxId: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      !data.isBusinessCustomer || (data.taxId && data.taxId.trim().length > 0),
    {
      message: 'Tax ID is required for business customers',
      path: ['taxId'],
    }
  )

export type BillingProfileInput = z.infer<typeof billingProfileSchema>
