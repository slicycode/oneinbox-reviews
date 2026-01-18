import { NextResponse } from 'next/server'
import withAuthRequired from '@/lib/auth/withAuthRequired'
import { db } from '@/db'
import { accounts, users } from '@/db/schema/user'
import { reviewSyncJobs } from '@/db/schema/review-sync-job'
import { and, eq, inArray } from 'drizzle-orm'
import { canDisconnectGoogle } from '@/lib/auth/google-disconnect'

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

  const userAuthState = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => rows[0])

  const linkedProviders = await db
    .select({ provider: accounts.provider })
    .from(accounts)
    .where(eq(accounts.userId, userId))

  const canDisconnect = canDisconnectGoogle({
    hasPassword: Boolean(userAuthState?.password),
    providers: linkedProviders.map((account) => account.provider),
  })

  if (!canDisconnect) {
    return NextResponse.json(
      {
        error: {
          code: 'google_disconnect_requires_password',
          message:
            'Set a password before disconnecting Google so you can still sign in.',
          details: {
            actionUrl: '/reset-password',
          },
        },
      },
      { status: 409 }
    )
  }

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
