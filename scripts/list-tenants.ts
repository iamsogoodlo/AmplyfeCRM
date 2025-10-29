import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          barbers: true,
          services: true,
          appointments: true,
        },
      },
    },
  })

  console.log('\n📋 Tenants:\n')
  tenants.forEach((tenant) => {
    console.log(`ID: ${tenant.id}`)
    console.log(`Name: ${tenant.name}`)
    console.log(`Timezone: ${tenant.timezone}`)
    console.log(`Stats: ${tenant._count.barbers} barbers, ${tenant._count.services} services, ${tenant._count.appointments} bookings`)
    console.log('---')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
