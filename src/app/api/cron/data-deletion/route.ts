import { NextResponse } from 'next/server'
import cronAuthRequired from '@/lib/auth/cronAuthRequired'
import { processDataDeletionJobs } from '@/lib/jobs/data-deletion'

const handleDataDeletionJobs = async () => {
  const result = await processDataDeletionJobs()
  const message =
    result.processed === 0
      ? 'No data deletion jobs to process'
      : 'Data deletion jobs processed'

  return NextResponse.json({
    success: true,
    message,
    processed: result.processed,
    processedAt: result.processedAt,
  })
}

export const GET = cronAuthRequired(handleDataDeletionJobs)
