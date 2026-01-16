import { NextResponse } from 'next/server'
import withAuthRequired from '@/lib/auth/withAuthRequired'
import { billingProfileSchema } from '@/lib/validations/billing-profile.schema'
import { db } from '@/db'
import { billingProfiles } from '@/db/schema/billing-profile'
import { eq } from 'drizzle-orm'

export const GET = withAuthRequired(async (_req, context) => {
  const userId = context.session.user.id
  const user = await context.getUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const profile = await db
    .select()
    .from(billingProfiles)
    .where(eq(billingProfiles.userId, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null)

  return NextResponse.json({ data: profile })
})

export const PUT = withAuthRequired(async (req, context) => {
  const body = await req.json()
  const validation = billingProfileSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error.errors },
      { status: 400 }
    )
  }

  const userId = context.session.user.id
  const user = await context.getUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  const payload = validation.data
  const normalizedTaxId = payload.isBusinessCustomer
    ? payload.taxId?.trim() || null
    : null
  const now = new Date()

  const profile = await db
    .insert(billingProfiles)
    .values({
      userId,
      country: payload.country,
      state: payload.state,
      city: payload.city,
      street: payload.street,
      zipcode: payload.zipcode,
      isBusinessCustomer: payload.isBusinessCustomer,
      taxId: normalizedTaxId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: billingProfiles.userId,
      set: {
        country: payload.country,
        state: payload.state,
        city: payload.city,
        street: payload.street,
        zipcode: payload.zipcode,
        isBusinessCustomer: payload.isBusinessCustomer,
        taxId: normalizedTaxId,
        updatedAt: now,
      },
    })
    .returning()
    .then((rows) => rows[0])

  return NextResponse.json({ data: profile })
})
