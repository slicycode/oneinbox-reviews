import { NextResponse } from 'next/server'
import withAuthRequired from '@/lib/auth/withAuthRequired'
import { db } from '@/db'
import { accounts } from '@/db/schema/user'
import { reviewSyncJobs } from '@/db/schema/review-sync-job'
import { and, eq, inArray } from 'drizzle-orm'

const revokeGoogleToken = async (token: string) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ token }),
    })

    if (!response.ok) {
      console.error('Failed to revoke Google token:', await response.text())
    }
  } catch (error) {
    console.error('Error revoking Google token:', error)
  }
}

export const DELETE = withAuthRequired(async (_req, context) => {
  const userId = context.session.user.id
  const now = new Date()

  const googleAccounts = await db
    .select({
      providerAccountId: accounts.providerAccountId,
      accessToken: accounts.access_token,
      refreshToken: accounts.refresh_token,
    })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')))

  await Promise.allSettled(
    googleAccounts.map(async (account) => {
      const token = account.accessToken ?? account.refreshToken
      if (!token) {
        return
      }
      await revokeGoogleToken(token)
    })
  )

  const stoppedJobs = await db
    .update(reviewSyncJobs)
    .set({ status: 'stopped', updatedAt: now })
    .where(
      and(
        eq(reviewSyncJobs.userId, userId),
        eq(reviewSyncJobs.provider, 'google'),
        inArray(reviewSyncJobs.status, ['pending', 'processing', 'queued'])
      )
    )
    .returning()

  const removedAccounts = await db
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')))
    .returning()

  return NextResponse.json({
    success: true,
    removed: removedAccounts.length > 0,
    stoppedJobs: stoppedJobs.length,
  })
})
