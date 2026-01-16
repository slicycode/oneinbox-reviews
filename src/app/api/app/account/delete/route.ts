import { NextResponse } from 'next/server'
import withAuthRequired from '@/lib/auth/withAuthRequired'
import { accountDeletionSchema } from '@/lib/validations/account-deletion.schema'
import { db } from '@/db'
import { users } from '@/db/schema/user'
import { eq } from 'drizzle-orm'
import { enqueueAccountDeletion } from '@/lib/jobs/account-deletion'

const CONFIRMATION_TEXT = 'delete my account'

export const DELETE = withAuthRequired(async (req, context) => {
  const body = await req.json()
  const validation = accountDeletionSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error.errors },
      { status: 400 }
    )
  }

  const confirmation = validation.data.confirmation
  if (confirmation !== CONFIRMATION_TEXT) {
    return NextResponse.json(
      { error: 'Confirmation text does not match' },
      { status: 400 }
    )
  }

  const userId = context.session.user.id
  const now = new Date()

  const updatedUser = await db
    .update(users)
    .set({ deletedAt: now })
    .where(eq(users.id, userId))
    .returning()
    .then((rows) => rows[0])

  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const job = await enqueueAccountDeletion(userId)

  return NextResponse.json({
    success: true,
    message: 'Account deletion requested',
    job,
  })
})
