import { db } from '@/db'
import { accountDeletionJobs } from '@/db/schema/account-deletion-job'
import { eq, inArray } from 'drizzle-orm'
import { dataDeletionJobs } from '@/db/schema/data-deletion-job'

type AccountDeletionJob = {
  id: string
  userId: string
  requestedAt: string
  status: string
  event: 'account.deletion.requested'
}

type AccountDeletionProcessResult = {
  processed: number
  processedAt: string
}

export const enqueueAccountDeletion = async (
  userId: string
): Promise<AccountDeletionJob> => {
  const now = new Date()

  const job = await db
    .insert(accountDeletionJobs)
    .values({
      userId,
      status: 'pending',
      requestedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: accountDeletionJobs.userId,
      set: {
        status: 'pending',
        requestedAt: now,
        updatedAt: now,
        error: null,
      },
    })
    .returning()
    .then((rows) => rows[0])

  const payload: AccountDeletionJob = {
    id: job.id,
    userId: job.userId,
    requestedAt: job.requestedAt.toISOString(),
    status: job.status,
    event: 'account.deletion.requested',
  }

  console.log(
    JSON.stringify({ level: 'info', event: payload.event, context: payload })
  )
  return payload
}

export const enqueuePolicyDeletion = async (params: {
  userId: string
  provider: string
  reason: string
}) => {
  const now = new Date()
  const job = await db
    .insert(dataDeletionJobs)
    .values({
      userId: params.userId,
      provider: params.provider,
      reason: params.reason,
      status: 'pending',
      requestedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [dataDeletionJobs.userId, dataDeletionJobs.provider],
      set: {
        reason: params.reason,
        status: 'pending',
        requestedAt: now,
        updatedAt: now,
        error: null,
      },
    })
    .returning()
    .then((rows) => rows[0])

  const payload = {
    id: job.id,
    userId: job.userId,
    status: job.status,
    requestedAt: job.requestedAt.toISOString(),
  }

  console.log(
    JSON.stringify({
      level: 'info',
      event: 'data.deletion.requested',
      context: payload,
    })
  )

  return payload
}

export const processAccountDeletionJobs =
  async (): Promise<AccountDeletionProcessResult> => {
    const pendingJobs = await db
      .select({
        id: accountDeletionJobs.id,
        userId: accountDeletionJobs.userId,
      })
      .from(accountDeletionJobs)
      .where(eq(accountDeletionJobs.status, 'pending'))

    if (pendingJobs.length === 0) {
      return {
        processed: 0,
        processedAt: new Date().toISOString(),
      }
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

    return {
      processed: pendingJobs.length,
      processedAt: now.toISOString(),
    }
  }
