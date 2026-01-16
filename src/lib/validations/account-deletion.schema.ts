import { z } from 'zod'

export const accountDeletionSchema = z.object({
  confirmation: z.string().trim().min(1, 'Confirmation is required'),
})

export type AccountDeletionInput = z.infer<typeof accountDeletionSchema>
