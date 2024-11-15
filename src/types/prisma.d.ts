import { Prisma } from '@prisma/client'

declare global {
  namespace PrismaJson {
    type UserCreateInput = Prisma.UserCreateInput
    type User = Prisma.User
  }
} 