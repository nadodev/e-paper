import { NextResponse } from 'next/server';
import { createNextRoute } from '@ts-rest/next';
import { contract, CreateUserSchema } from '@/lib/api/contract';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

const router = createNextRoute(contract, {
  getUsers: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  createUser: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  updateUser: async ({ params, body }) => {
    try {
      const validatedData = CreateUserSchema.parse(body);
  
      // Verifica se o usuário existe no banco de dados
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
      });
  
      if (!existingUser) {
        return { status: 404, body: { error: 'Usuário não encontrado' } };
      }
  
      // Verifica se o email está sendo usado por outro usuário
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: params.id },
        },
      });
  
      if (emailInUse) {
        return { status: 400, body: { error: 'Email já cadastrado' } };
      }
  
      // Atualiza os dados do usuário no banco de dados
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          ...validatedData,
          updatedAt: new Date(), // Atualiza a data de modificação
        },
      });
  
      // Retorna o usuário atualizado com status de sucesso
      return {
        status: 200,
        body: {
          id: updatedUser.id,
          nome: updatedUser.nome,
          email: updatedUser.email,
          status: updatedUser.status as "ativo" | "inativo",
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      };
    } catch (err) {
      // Tratamento específico para erros do Zod
      if (err instanceof z.ZodError) {
        console.warn('Validation error:', err.errors);
        return {
          status: 400,
          body: { error: err.errors.map(e => e.message).join('; ') },
        };
      }
  
      // Log de erro genérico para diagnóstico
      console.error('Error updating user:', err);
  
      // Retorna erro genérico para o cliente
      return { status: 500, body: { error: 'Erro ao atualizar o usuário' } };
    }
  },
  

  deleteUser: async ({ params }) => {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
      });

      if (!existingUser) {
        return { status: 404, body: { error: 'Usuário não encontrado' } };
      }

      await prisma.user.delete({
        where: { id: params.id },
      });

      return { status: 200, body: { success: true } };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { status: 500, body: { error: 'Failed to delete user' } };
    }
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

export const PUT = async (request: Request, { params }: { params: { id: string } }) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const body = await request.json();
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.updateUser({ params, body, headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
};

export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.deleteUser({ params, headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
};