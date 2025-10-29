import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.userAccount.upsert({
    where: { email: 'demo@salon.com' },
    update: {},
    create: {
      email: 'demo@salon.com',
      password: hashedPassword,
      displayName: 'Demo User',
    },
  })

  console.log('✅ Created user:', user.email)

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo Barbershop',
      timezone: 'America/Toronto',
    },
  })

  console.log('✅ Created tenant:', tenant.name)

  // Link user to tenant
  await prisma.tenantUser.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: Role.OWNER,
    },
  })

  // Create services
  const services = [
    { name: 'Haircut', durationMin: 30, priceCents: 3000 },
    { name: 'Beard Trim', durationMin: 15, priceCents: 1500 },
    { name: 'Haircut + Beard', durationMin: 45, priceCents: 4000 },
    { name: 'Kids Haircut', durationMin: 20, priceCents: 2000 },
  ]

  for (const [idx, service] of services.entries()) {
    await prisma.service.upsert({
      where: {
        id: `demo-service-${idx}`,
      },
      update: {},
      create: {
        id: `demo-service-${idx}`,
        tenantId: tenant.id,
        ...service,
        ordering: idx,
      },
    })
  }

  console.log('✅ Created services')

  // Create barbers
  const barbers = [
    { name: 'Alex', color: '#3b82f6' },
    { name: 'Jordan', color: '#10b981' },
    { name: 'Taylor', color: '#f59e0b' },
  ]

  for (const [idx, barber] of barbers.entries()) {
    const created = await prisma.barber.upsert({
      where: {
        id: `demo-barber-${idx}`,
      },
      update: {},
      create: {
        id: `demo-barber-${idx}`,
        tenantId: tenant.id,
        ...barber,
      },
    })

    // Create schedule rules (Mon-Sat, 9-5)
    for (let weekday = 1; weekday <= 6; weekday++) {
      await prisma.scheduleRule.create({
        data: {
          tenantId: tenant.id,
          barberId: created.id,
          weekday,
          startTime: '09:00',
          endTime: '17:00',
        },
      })
    }
  }

  console.log('✅ Created barbers with schedules')

  // Create demo customer
  await prisma.customer.upsert({
    where: {
      id: 'demo-customer-1',
    },
    update: {},
    create: {
      id: 'demo-customer-1',
      tenantId: tenant.id,
      name: 'John Doe',
      phone: '(416) 555-0199',
      email: 'john@example.com',
    },
  })

  console.log('✅ Created demo customer')

  console.log('\n🎉 Seeding complete!')
  console.log('\nLogin credentials:')
  console.log('Email: demo@salon.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
