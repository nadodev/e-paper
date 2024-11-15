import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// User Schemas
const UserSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  status: z.enum(['ativo', 'inativo']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
});

// Document Schemas
const DocumentSchema = z.object({
  id: z.string(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  emitente: z.string().min(1, 'Emitente é obrigatório'),
  valor_total_tributos: z.number().min(0, 'Valor total de tributos deve ser maior ou igual a zero'),
  valor_liquido: z.number().min(0, 'Valor líquido deve ser maior ou igual a zero'),
  arquivo_url: z.string().nullable().optional(),
  data_criacao: z.date(),
  ultima_atualizacao: z.date(),
});

export const CreateDocumentSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  emitente: z.string().min(1, 'Emitente é obrigatório'),
  valor_total_tributos: z.number().min(0, 'Valor total de tributos deve ser maior ou igual a zero'),
  valor_liquido: z.number().min(0, 'Valor líquido deve ser maior ou igual a zero'),
  arquivo_url: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;

export const contract = c.router({
  // User routes
  getUsers: {
    method: 'GET',
    path: '/api/users',
    responses: {
      200: z.array(UserSchema),
      500: z.object({ error: z.string() }),
    },
  },
  createUser: {
    method: 'POST',
    path: '/api/users',
    body: CreateUserSchema,
    responses: {
      201: UserSchema,
      400: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
  updateUser: {
    method: 'PUT',
    path: '/api/users/:id',
    body: CreateUserSchema,
    responses: {
      200: UserSchema,
      400: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
  deleteUser: {
    method: 'DELETE',
    path: '/api/users/:id',
    responses: {
      200: z.object({ success: z.boolean() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Document routes
  getDocuments: {
    method: 'GET',
    path: '/api/documents',
    responses: {
      200: z.array(DocumentSchema),
      500: z.object({ error: z.string() }),
    },
  },
  createDocument: {
    method: 'POST',
    path: '/api/documents',
    body: CreateDocumentSchema,
    responses: {
      201: DocumentSchema,
      400: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
  updateDocument: {
    method: 'PUT',
    path: '/api/documents/:id',
    body: CreateDocumentSchema,
    responses: {
      200: DocumentSchema,
      400: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
  deleteDocument: {
    method: 'DELETE',
    path: '/api/documents/:id',
    responses: {
      200: z.object({ success: z.boolean() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
});

export type AppContract = typeof contract; 