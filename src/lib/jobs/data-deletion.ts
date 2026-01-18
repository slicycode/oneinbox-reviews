import { db } from '@/db'
import { dataDeletionJobs } from '@/db/schema/data-deletion-job'
import { eq, inArray } from 'drizzle-orm'

type DataDeletionProcessResult = {
  processed: number
  processedAt: string
}

export const processDataDeletionJobs =
  async (): Promise<DataDeletionProcessResult> => {
    const pendingJobs = await db
      .select({
        id: dataDeletionJobs.id,
      })
      .from(dataDeletionJobs)
      .where(eq(dataDeletionJobs.status, 'pending'))

    if (pendingJobs.length === 0) {
      return {
        processed: 0,
        processedAt: new Date().toISOString(),
      }
    }

    const now = new Date()
    await db
      .update(dataDeletionJobs)
      .set({
        status: 'deferred',
        error: 'Provider data deletion not implemented',
        updatedAt: now,
      })
      .where(
        inArray(
          dataDeletionJobs.id,
          pendingJobs.map((job) => job.id)
        )
      )

    return {
      processed: pendingJobs.length,
      processedAt: now.toISOString(),
    }
  }
