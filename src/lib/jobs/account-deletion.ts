import { db } from '@/db'
import { accountDeletionJobs } from '@/db/schema/account-deletion-job'

type AccountDeletionJob = {
  id: string
  userId: string
  requestedAt: string
  status: string
  event: 'account.deletion.requested'
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
