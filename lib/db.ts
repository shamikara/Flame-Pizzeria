// This is a placeholder for your database connection
// In a real app, you would use a proper database like MySQL, PostgreSQL, or MongoDB

import { PrismaClient } from "@prisma/client"

// To avoid multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
