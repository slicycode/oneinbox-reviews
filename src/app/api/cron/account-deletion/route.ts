import { NextResponse } from 'next/server'
import { db } from '@/db'
import { accountDeletionJobs } from '@/db/schema/account-deletion-job'
import { eq, inArray } from 'drizzle-orm'
import cronAuthRequired from '@/lib/auth/cronAuthRequired'

const handleAccountDeletionJobs = async () => {
  const pendingJobs = await db
    .select({
      id: accountDeletionJobs.id,
      userId: accountDeletionJobs.userId,
    })
    .from(accountDeletionJobs)
    .where(eq(accountDeletionJobs.status, 'pending'))

  if (pendingJobs.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No account deletion jobs to process',
      processedAt: new Date().toISOString(),
      processed: 0,
    })
  }

  const now = new Date()
  await db
    .update(accountDeletionJobs)
    .set({
      status: 'processed',
      processedAt: now,
      updatedAt: now,
    })
    .where(
      inArray(
        accountDeletionJobs.id,
        pendingJobs.map((job) => job.id)
      )
    )

  return NextResponse.json({
    success: true,
    message: 'Account deletion jobs processed',
    processed: pendingJobs.length,
    processedAt: now.toISOString(),
  })
}

export const GET = cronAuthRequired(handleAccountDeletionJobs)
