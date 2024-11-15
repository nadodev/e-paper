import { NextResponse } from 'next/server';
import { createNextRoute } from '@ts-rest/next';
import { contract, CreateDocumentSchema } from '@/lib/api/contract';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Decimal } from '@prisma/client/runtime/library';

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
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },
  createDocument: async () => {
    return { status: 405, body: { error: 'Method not allowed in this route' } };
  },
  updateDocument: async ({ params, body }) => {
    try {
      const validatedData = CreateDocumentSchema.parse(body);

      const existingDocument = await prisma.document.findUnique({
        where: { id: params.id },
      });

      if (!existingDocument) {
        return { status: 404, body: { error: 'Documento não encontrado' } };
      }

      const codigoInUse = await prisma.document.findFirst({
        where: { 
          codigo: validatedData.codigo,
          NOT: { id: params.id }
        },
      });

      if (codigoInUse) {
        return { status: 400, body: { error: 'Código já cadastrado' } };
      }

      // Preparar os dados para atualização
      const updateData = {
        codigo: validatedData.codigo,
        emitente: validatedData.emitente,
        valor_total_tributos: new Decimal(validatedData.valor_total_tributos.toString()),
        valor_liquido: new Decimal(validatedData.valor_liquido.toString()),
        ultima_atualizacao: new Date(),
      };

      // Se arquivo_url foi fornecido, adiciona ao objeto de atualização
      if (validatedData.arquivo_url !== undefined) {
        Object.assign(updateData, { arquivo_url: validatedData.arquivo_url });
      }

      const document = await prisma.document.update({
        where: { id: params.id },
        data: updateData,
      });

      return { status: 200, body: document };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return { status: 400, body: { error: err.errors[0].message } };
      }
      console.error('Error updating document:', err);
      return { status: 500, body: { error: 'Erro ao atualizar documento' } };
    }
  },
  deleteDocument: async ({ params }) => {
    try {
      const existingDocument = await prisma.document.findUnique({
        where: { id: params.id },
      });

      if (!existingDocument) {
        return { status: 404, body: { error: 'Documento não encontrado' } };
      }

      await prisma.document.delete({
        where: { id: params.id },
      });

      return { status: 200, body: { success: true } };
    } catch (err) {
      console.error('Error deleting document:', err);
      return { status: 500, body: { error: 'Failed to delete document' } };
    }
  },
});

export const PUT = async (request: Request, { params }: { params: { id: string } }) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const body = await request.json();
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.updateDocument({ params, body, headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
};

export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
  const req = request as unknown as NextApiRequest;
  const res = new NextResponse() as unknown as NextApiResponse;
  const headers = Object.fromEntries(request.headers.entries());
  const result = await router.deleteDocument({ params, headers, req, res });
  return NextResponse.json(result.body, { status: result.status });
}; 