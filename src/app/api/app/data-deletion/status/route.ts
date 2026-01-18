import { NextResponse } from 'next/server'
import withAuthRequired from '@/lib/auth/withAuthRequired'
import { db } from '@/db'
import { dataDeletionJobs } from '@/db/schema/data-deletion-job'
import { desc, eq } from 'drizzle-orm'

export const GET = withAuthRequired(async (_req, context) => {
  const jobs = await db
    .select({
      id: dataDeletionJobs.id,
      provider: dataDeletionJobs.provider,
      status: dataDeletionJobs.status,
      requestedAt: dataDeletionJobs.requestedAt,
      processedAt: dataDeletionJobs.processedAt,
      error: dataDeletionJobs.error,
    })
    .from(dataDeletionJobs)
    .where(eq(dataDeletionJobs.userId, context.session.user.id))
    .orderBy(desc(dataDeletionJobs.requestedAt))
    .limit(10)

  return NextResponse.json({
    jobs: jobs.map((job) => ({
      ...job,
      requestedAt: job.requestedAt.toISOString(),
      processedAt: job.processedAt?.toISOString() ?? null,
    })),
  })
})
