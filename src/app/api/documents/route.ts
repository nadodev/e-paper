import { NextResponse } from 'next/server';
import { createNextRoute } from '@ts-rest/next';
import { contract, CreateDocumentSchema } from '@/lib/api/contract';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';

const router = createNextRoute(contract, {
  // User methods (required by contract)
  getUsers: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },
  createUser: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },
  updateUser: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },
  deleteUser: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },

  // Document methods
  getDocuments: async () => {
    try {
      const documents = await prisma.document.findMany({
        orderBy: { data_criacao: 'desc' },
      });
  
      // Converte os valores Decimal para number
      const formattedDocuments = documents.map(doc => ({
        ...doc,
        valor_total_tributos: doc.valor_total_tributos.toNumber(),
        valor_liquido: doc.valor_liquido.toNumber(),
      }));
  
      return { status: 200, body: formattedDocuments };
    } catch (err) {
      console.error('Error fetching documents:', err);
      return { status: 500, body: { error: 'Failed to fetch documents' } };
    }
  },
  

  createDocument: async ({ body }) => {
    try {
      // Valida os dados
      const validatedData = CreateDocumentSchema.parse(body);
  
      const existingDocument = await prisma.document.findUnique({
        where: { codigo: validatedData.codigo },
      });
  
      if (existingDocument) {
        return { status: 400, body: { error: 'Código já cadastrado' } };
      }
  
      const document = await prisma.document.create({
        data: {
          codigo: validatedData.codigo,
          emitente: validatedData.emitente,
          valor_total_tributos: new Decimal(validatedData.valor_total_tributos.toString()),
          valor_liquido: new Decimal(validatedData.valor_liquido.toString()),
          arquivo_url: validatedData.arquivo_url || null,
          data_criacao: new Date(),
          ultima_atualizacao: new Date(),
        },
      });
  
      // Converte os valores de Decimal para number antes de retornar
      const formattedDocument = {
        ...document,
        valor_total_tributos: document.valor_total_tributos.toNumber(),
        valor_liquido: document.valor_liquido.toNumber(),
      };
  
      return { status: 201, body: formattedDocument };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { status: 400, body: { error: err.errors[0].message } };
      }
      console.error('Error creating document:', err);
      return { status: 500, body: { error: 'Failed to create document' } };
    }
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
  const result = await router.getDocuments({ headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
};

export const POST = async (request: Request) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const body = await request.json();
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.createDocument({ body, headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
}; 