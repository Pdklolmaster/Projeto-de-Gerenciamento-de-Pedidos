# 🛒 API de Gestão de Pedidos

> **Projeto de Gerenciamento de Pedidos**

API REST desenvolvida em Node.js para gerenciamento de pedidos, com transformação automática de dados e documentação Swagger.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Autenticação JWT](#-autenticação-jwt)
- [Endpoints da API](#-endpoints-da-api)
- [Transformação de Dados](#-transformação-de-dados)
- [Estrutura do Banco de Dados](#️-estrutura-do-banco-de-dados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Decisões Técnicas](#-decisões-técnicas)

---

## 🎯 Sobre o Projeto

Esta API foi desenvolvida para demonstrar habilidades em desenvolvimento de APIs REST com Node.js.

### Funcionalidades Implementadas:

| Requisito | Status | Endpoint |
|-----------|--------|----------|
| Autenticação JWT | ✅ | `POST /auth/registrar`, `POST /auth/login` |
| Criar pedido | ✅ Obrigatório | `POST /order` |
| Buscar pedido por número | ✅ Obrigatório | `GET /order/:numeroPedido` |
| Listar todos os pedidos | ✅ Opcional | `GET /order/list` |
| Atualizar pedido | ✅ Opcional | `PUT /order/:numeroPedido` |
| Deletar pedido | ✅ Opcional | `DELETE /order/:numeroPedido` |
| Documentação Swagger | ✅ Opcional | `/api-docs` |

---

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimalista
- **SQLite** (sql.js) - Banco de dados SQL leve
- **JWT** (jsonwebtoken) - Autenticação via tokens
- **bcryptjs** - Hash seguro de senhas
- **Swagger** - Documentação interativa da API
- **express-validator** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

---

## 🔧 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/api-pedidos.git
cd api-pedidos
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite conforme necessário (opcional)
```

### 4. Execute a aplicação

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm start
```

### 5. Acesse a API

- **API Base:** http://localhost:3000
- **Documentação Swagger:** http://localhost:3000/api-docs

---

## 🔐 Autenticação JWT

A API utiliza autenticação baseada em tokens JWT. Para acessar os endpoints de pedidos, é necessário estar autenticado.

### 1. Registrar um novo usuário

```bash
curl --location 'http://localhost:3000/auth/registrar' \
--header 'Content-Type: application/json' \
--data-raw '{
  "nome": "Meu Nome",
  "email": "meu@email.com",
  "senha": "minhaSenha123"
}'
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Usuário registrado com sucesso!",
  "usuario": {
    "id": 1,
    "nome": "Meu Nome",
    "email": "meu@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Fazer login

```bash
curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "meu@email.com",
  "senha": "minhaSenha123"
}'
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso!",
  "usuario": {
    "id": 1,
    "nome": "Meu Nome",
    "email": "meu@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Usar o token nas requisições

Adicione o token no header `Authorization` de todas as requisições aos endpoints de pedidos:

```bash
curl --location 'http://localhost:3000/order/list' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Endpoints de Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/auth/registrar` | Registrar novo usuário | Não |
| POST | `/auth/login` | Fazer login | Não |
| GET | `/auth/verificar` | Verificar token válido | Sim |

---

## 📡 Endpoints da API

> **Nota:** Todos os endpoints de pedidos requerem autenticação. Adicione o header `Authorization: Bearer <seu_token>` nas requisições.

### Criar Pedido
```http
POST http://localhost:3000/order
Content-Type: application/json
Authorization: Bearer <seu_token>
```

### Buscar Pedido
```http
GET http://localhost:3000/order/v10089016vdb
Authorization: Bearer <seu_token>
```

### Listar Todos os Pedidos
```http
GET http://localhost:3000/order/list
Authorization: Bearer <seu_token>
```

### Atualizar Pedido
```http
PUT http://localhost:3000/order/v10089016vdb
Content-Type: application/json
Authorization: Bearer <seu_token>
```

### Deletar Pedido
```http
DELETE http://localhost:3000/order/v10089016vdb
Authorization: Bearer <seu_token>
```

---

## 🔄 Transformação de Dados

A API realiza transformação automática dos campos:

### Entrada (PT-BR) → Banco (EN)

| Campo Entrada | Campo Banco |
|---------------|-------------|
| `numeroPedido` | `orderId` |
| `valorTotal` | `value` |
| `dataCriacao` | `creationDate` |
| `idItem` | `productId` |
| `quantidadeItem` | `quantity` |
| `valorItem` | `price` |

### Exemplo de Transformação

**Recebido pela API:**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**Salvo no Banco:**
```json
{
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

---

## �️ Estrutura do Banco de Dados

### Tabela: Order

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `orderId` | TEXT (PK) | Identificador único do pedido |
| `value` | REAL | Valor total do pedido |
| `creationDate` | TEXT | Data de criação do pedido (ISO 8601) |

### Tabela: Items

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `orderId` | TEXT (FK) | Referência ao pedido |
| `productId` | INTEGER | Identificador do produto |
| `quantity` | INTEGER | Quantidade do item |
| `price` | REAL | Preço do item |

---

## �📁 Estrutura do Projeto

```
api-pedidos/
├── src/
│   ├── config/
│   │   └── swagger.js       # Configuração do Swagger
│   ├── controllers/
│   │   ├── AuthController.js    # Lógica de autenticação
│   │   └── OrderController.js   # Lógica de negócio dos pedidos
│   ├── database/
│   │   └── connection.js    # Conexão e criação do banco SQLite
│   ├── middlewares/
│   │   ├── auth.js          # Middleware de autenticação JWT
│   │   ├── errorHandler.js  # Tratamento global de erros
│   │   └── validators.js    # Validações de entrada
│   ├── routes/
│   │   ├── authRoutes.js    # Rotas de autenticação
│   │   └── orderRoutes.js   # Rotas de pedidos
│   ├── utils/
│   │   ├── AppError.js      # Classe de erro personalizada
│   │   └── transformador.js # Mapeamento, normalização e validação de dados
│   └── server.js            # Ponto de entrada da aplicação
├── .env                     # variáveis de ambiente
├── .gitignore               # Arquivos ignorados pelo Git
├── package.json             # Dependências e scripts
└── README.md                # Documentação do projeto
```

---

## 💡 Exemplos de Uso

### 1. Fazer Login e Obter Token

```bash
curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "seu@email.com",
  "senha": "suaSenha123"
}'
```

### 2. Criar um Pedido (com Token)

```bash
curl --location 'http://localhost:3000/order' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <seu_token>' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'
```

### Resposta de Sucesso

```json
{
  "sucesso": true,
  "mensagem": "Pedido criado com sucesso!",
  "pedido": {
    "orderId": "v10089015vdb-01",
    "value": 10000,
    "creationDate": "2023-07-19T12:24:11.529Z",
    "items": [
      {
        "productId": 2434,
        "quantity": 1,
        "price": 1000
      }
    ]
  }
}
```

---

## ⚠️ Tratamento de Erros

A API possui tratamento robusto de erros com mensagens claras:

### Códigos HTTP Utilizados

| Código | Significado | Quando é usado |
|--------|-------------|----------------|
| `200` | OK | Operação realizada com sucesso |
| `201` | Created | Pedido/Usuário criado com sucesso |
| `400` | Bad Request | Dados inválidos na requisição |
| `401` | Unauthorized | Token não fornecido, inválido ou expirado |
| `404` | Not Found | Pedido não encontrado |
| `409` | Conflict | Pedido ou email já existe |
| `500` | Internal Error | Erro interno do servidor |

### Exemplos de Resposta de Erro

**Erro de Autenticação (401):**
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "TOKEN_NAO_FORNECIDO",
    "mensagem": "Token de autenticação não fornecido. Faça login para obter um token."
  }
}
```

**Erro de Pedido Não Encontrado (404):**
```json
{
  "sucesso": false,
  "erro": {
    "codigo": "PEDIDO_NAO_ENCONTRADO",
    "mensagem": "Não foi encontrado nenhum pedido com o número \"xyz123\"."
  }
}
```

---

## 🧠 Decisões Técnicas

### Por que SQLite?
- **Simplicidade:** Não requer servidor de banco separado
- **Portabilidade:** Banco em arquivo único, fácil de testar
- **Compatibilidade:** Sintaxe SQL padrão, fácil migração para PostgreSQL

### Por que Express?
- **Ecossistema maduro:** Grande quantidade de middlewares disponíveis
- **Simplicidade:** Curva de aprendizado suave
- **Performance:** Rápido e leve

### Padrão de Projeto
- **MVC simplificado:** Separação clara entre rotas, controllers e dados
- **Middlewares:** Validação e tratamento de erros centralizados
- **Transformador:** Isolamento da lógica de mapeamento de campos

### Por que JWT?
- **Stateless:** Não requer armazenamento de sessão no servidor
- **Escalável:** Funciona bem em ambientes distribuídos
- **Seguro:** Token assinado digitalmente, difícil de falsificar
- **Flexível:** Token contém informações do usuário (id, email, nome)

---

## 👤 Autor

**Pablo de Oliveira Silva**

- Email: pablo_tecmastery@outlook.com
- GitHub: [@pablooliveira](https://github.com/pablooliveira)
- LinkedIn: [/in/pablooliveira](https://linkedin.com/in/pablooliveira)
- Website: [divulgakaloferta.com.br](https://www.divulgakaloferta.com.br)

### 🌐 Meu Projeto Pessoal

Acesse meu site **[DivulgaKalOferta](https://www.divulgakaloferta.com.br)**, onde ofereço:
- Serviços de afiliados
- Conversão de links
- Geração automática de posts
- Sistema de cadastro e autenticação
- Integração com API de pagamento
- Painel de gerenciamento
- Monitoramento com Grafana + Prometheus
