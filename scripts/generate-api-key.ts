import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const tenantId = process.argv[2]

  if (!tenantId) {
    console.error('Usage: npm run generate-key <tenantId>')
    console.log('\nTo find your tenant ID, run:')
    console.log('  npm run list-tenants')
    process.exit(1)
  }

  // Generate API key
  const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')

  // Save to database
  await prisma.apiKey.create({
    data: {
      tenantId,
      name: 'n8n Integration',
      hashedKey,
    },
  })

  console.log('\n✅ API Key Generated!\n')
  console.log('Add this to your n8n environment variables:\n')
  console.log(`CRM_API_KEY="${apiKey}"`)
  console.log('\n⚠️  Save this key securely - it won\'t be shown again!\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
