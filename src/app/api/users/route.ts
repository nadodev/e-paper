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
  
      // Mapeia os usuários para garantir que o status seja do tipo esperado
      const formattedUsers = users.map(user => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        status: user.status as "ativo" | "inativo", // Garante compatibilidade com o contrato
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
  
      return {
        status: 200,
        body: formattedUsers,
      };
    } catch (err) {
      console.error('Error fetching users:', err);
      return {
        status: 500,
        body: { error: 'Erro ao buscar os usuários' },
      };
    }
  },
  
  
  createUser: async ({ body }) => {
    try {
      // Valida os dados enviados no corpo da requisição
      const validatedData = CreateUserSchema.parse(body);
  
      // Verifica se já existe um usuário com o email fornecido
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
  
      if (existingUser) {
        return { status: 400, body: { error: 'Email já cadastrado' } };
      }
  
      // Cria um novo usuário no banco de dados
      const newUser = await prisma.user.create({
        data: {
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
  
      // Formata o usuário criado para garantir compatibilidade com o contrato
      const formattedUser = {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        status: newUser.status as "ativo" | "inativo", // Garantimos que o tipo está correto
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
  
      return {
        status: 201,
        body: formattedUser,
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
  
      // Loga o erro e retorna um status de erro genérico
      console.error('Error creating user:', err);
      return { status: 500, body: { error: 'Erro ao criar o usuário' } };
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