import { prisma } from './db'
import { auth } from './auth'
import { headers } from 'next/headers'
import { Role } from '@prisma/client'

export async function getCurrentTenant() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Check for tenant selection in headers (from middleware)
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  if (tenantId) {
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        tenantId,
        userId: session.user.id,
      },
      include: {
        tenant: true,
      },
    })
    return tenantUser?.tenant || null
  }

  // Default to first tenant
  const tenantUser = await prisma.tenantUser.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      tenant: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return tenantUser?.tenant || null
}

export async function getUserTenants(userId: string) {
  return await prisma.tenantUser.findMany({
    where: { userId },
    include: { tenant: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getUserRole(tenantId: string, userId: string): Promise<Role | null> {
  const tenantUser = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
  })
  return tenantUser?.role || null
}

export async function hasPermission(
  tenantId: string,
  userId: string,
  requiredRoles: Role[]
): Promise<boolean> {
  const role = await getUserRole(tenantId, userId)
  if (!role) return false
  return requiredRoles.includes(role)
}

export async function requireOwnerOrAdmin(tenantId: string, userId: string) {
  const allowed = await hasPermission(tenantId, userId, [Role.OWNER, Role.ADMIN])
  if (!allowed) {
    throw new Error('Unauthorized: Owner or Admin role required')
  }
}
