
## 🚀 Funcionalidades

### Gestão de Usuários
- ✅ CRUD completo
- ✅ Listagem com filtros
- ✅ Status ativo/inativo
- ✅ Validação de email único
- ✅ Modal de criação/edição
- ✅ Confirmação de exclusão

### Gestão de Documentos
- ✅ CRUD completo
- ✅ Upload de arquivos (PDF, JPEG, PNG)
- ✅ Geração automática de código
- ✅ Seleção de emitente
- ✅ Valores monetários formatados
- ✅ Paginação (10 itens/página)
- ✅ Busca por código/emitente
- ✅ Seleção múltipla para exclusão
- ✅ Menu de ações (3 pontos)
- ✅ Modal de visualização
- ✅ Preview de arquivos
- ✅ Sumário com totais

### Dashboard
- ✅ Total de usuários
- ✅ Usuários ativos
- ✅ Usuários inativos
- ✅ Taxa de ativação

## 🛠️ Tecnologias

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/UI
- ts-rest
- Lucide Icons
- Zod

### Backend
- Next.js API Routes
- Prisma ORM
- MySQL
- Docker

## 🔒 Validações

### Usuários
- Email único
- Nome obrigatório
- Email válido
- Status válido

### Documentos
- Código único
- Emitente obrigatório
- Valores não negativos
- Tipos de arquivo permitidos
- Tamanho máximo de arquivo (5MB)

## 🔄 API

### Rotas de Usuários
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Rotas de Documentos
- GET /api/documents
- POST /api/documents
- PUT /api/documents/:id
- DELETE /api/documents/:id
- POST /api/upload

## 🎨 Interface

### Layout
- Menu lateral retrátil
- Cabeçalho fixo
- Responsivo
- Modal para formulários
- Feedback visual
- Loading states

### Componentes
- Tabelas
- Formulários
- Botões
- Inputs
- Modais
- Menus
- Ícones

## 🔧 Configuração

### Requisitos
- Node.js 18+
- Docker
- MySQL

### Variáveis de Ambiente
- DATABASE_URL
- NEXT_PUBLIC_API_URL

### Comandos
