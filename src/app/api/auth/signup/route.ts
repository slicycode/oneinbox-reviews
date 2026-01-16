import { NextResponse } from 'next/server'
import { signUpWithPasswordSchema } from '@/lib/validations/auth.schema'
import { hashPassword } from '@/lib/auth/password'
import { db } from '@/db'
import { users } from '@/db/schema/user'
import { eq } from 'drizzle-orm'
import onUserCreate from '@/lib/users/onUserCreate'

// Force Node.js runtime for argon2 support
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = signUpWithPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0])

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      })
      .returning()
      .then((rows) => rows[0])

    await onUserCreate(newUser)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      email,
    })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
