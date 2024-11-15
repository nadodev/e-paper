import { NextResponse } from 'next/server';
import { createNextRoute } from '@ts-rest/next';
import { contract, CreateUserSchema } from '@/lib/api/contract';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

const router = createNextRoute(contract, {
  getUsers: async () => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { status: 200, body: users };
    } catch (err) {
      console.error('Error fetching users:', err);
      return { status: 500, body: { error: 'Failed to fetch users' } };
    }
  },

  createUser: async ({ body }) => {
    try {
      const validatedData = CreateUserSchema.parse(body);

      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return { status: 400, body: { error: 'Email já cadastrado' } };
      }

      const user = await prisma.user.create({
        data: {
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { status: 201, body: user };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { status: 400, body: { error: err.errors[0].message } };
      }
      console.error('Error creating user:', err);
      return { status: 500, body: { error: 'Failed to create user' } };
    }
  },

  updateUser: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  deleteUser: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  // Document methods
  getDocuments: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  createDocument: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  updateDocument: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  deleteDocument: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },
});

export const GET = async (request: Request) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.getUsers({ headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
};

export const POST = async (request: Request) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const body = await request.json();
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.createUser({ body, headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
};