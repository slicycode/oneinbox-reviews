import { NextResponse } from 'next/server'
import cronAuthRequired from '@/lib/auth/cronAuthRequired'
import { processAccountDeletionJobs } from '@/lib/jobs/account-deletion'

const handleAccountDeletionJobs = async () => {
  const result = await processAccountDeletionJobs()
  const message =
    result.processed === 0
      ? 'No account deletion jobs to process'
      : 'Account deletion jobs processed'

  return NextResponse.json({
    success: true,
    message,
    processed: result.processed,
    processedAt: result.processedAt,
  })
}

export const GET = cronAuthRequired(handleAccountDeletionJobs)
