import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error },
        { status: 400 }
      )
    }

    const { email, password, displayName } = parsed.data

    // Check if user already exists
    const existing = await prisma.userAccount.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.userAccount.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
      },
    })

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
