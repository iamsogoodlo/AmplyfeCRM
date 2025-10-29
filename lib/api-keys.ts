import { prisma } from './db'
import crypto from 'crypto'

export async function generateApiKey(tenantId: string, name: string): Promise<string> {
  // Generate a random API key
  const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`

  // Hash it for storage
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')

  // Store in database
  await prisma.apiKey.create({
    data: {
      tenantId,
      name,
      hashedKey,
    },
  })

  // Return the plain key (only time it's visible)
  return apiKey
}

export async function validateApiKey(apiKey: string): Promise<string | null> {
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')

  const key = await prisma.apiKey.findUnique({
    where: { hashedKey },
  })

  if (!key) return null

  // Update last used
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  })

  return key.tenantId
}
