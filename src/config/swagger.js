/**
 * ============================================
 * CONFIGURAÇÃO DO SWAGGER
 * ============================================
 * 
 * Configura a documentação automática da API usando Swagger/OpenAPI.
 * Acessível em: http://localhost:3000/api-docs
 * 
 * @author Pablo de Oliveira Silva
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Opções de configuração do Swagger
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Pedidos',
      version: '1.0.0',
      description: `
## 📦 API REST para Gerenciamento de Pedidos

API desenvolvida para gerenciamento completo de pedidos com autenticação JWT.

### 🔐 Autenticação:
- Registre-se em \`POST /auth/registrar\`
- Faça login em \`POST /auth/login\` para obter o token
- Use o token no header: \`Authorization: Bearer <seu_token>\`

### Funcionalidades:
- ✅ Autenticação com JWT
- ✅ Criar novos pedidos
- ✅ Buscar pedidos por número
- ✅ Listar todos os pedidos
- ✅ Atualizar pedidos existentes
- ✅ Deletar pedidos

### Transformação de Dados:
A API realiza transformação automática dos campos:
- \`numeroPedido\` → \`orderId\`
- \`valorTotal\` → \`value\`
- \`dataCriacao\` → \`creationDate\`
- \`idItem\` → \`productId\`
- \`quantidadeItem\` → \`quantity\`
- \`valorItem\` → \`price\`
      `,
      contact: {
        name: 'Pablo de Oliveira Silva',
        email: 'pablo_tecmastery@outlook.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Registro e login de usuários'
      },
      {
        name: 'Pedidos',
        description: 'Operações relacionadas a pedidos (requer autenticação)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no endpoint /auth/login'
        }
      },
      schemas: {
        // Esquema de entrada (formato PT-BR que a API recebe)
        PedidoEntrada: {
          type: 'object',
          required: ['numeroPedido', 'valorTotal', 'dataCriacao', 'items'],
          properties: {
            numeroPedido: {
              type: 'string',
              description: 'Número único do pedido',
              example: 'v10089015vdb-01'
            },
            valorTotal: {
              type: 'number',
              description: 'Valor total do pedido',
              example: 10000
            },
            dataCriacao: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do pedido (ISO 8601)',
              example: '2023-07-19T12:24:11.5299601+00:00'
            },
            items: {
              type: 'array',
              description: 'Lista de itens do pedido',
              items: {
                $ref: '#/components/schemas/ItemEntrada'
              }
            }
          }
        },
        // Esquema de item de entrada
        ItemEntrada: {
          type: 'object',
          required: ['idItem', 'quantidadeItem', 'valorItem'],
          properties: {
            idItem: {
              type: 'string',
              description: 'ID do produto',
              example: '2434'
            },
            quantidadeItem: {
              type: 'integer',
              description: 'Quantidade do item',
              example: 1
            },
            valorItem: {
              type: 'number',
              description: 'Valor unitário do item',
              example: 1000
            }
          }
        },
        // Esquema de resposta (formato EN usado no banco)
        PedidoResposta: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              example: 'v10089015vdb-01'
            },
            value: {
              type: 'number',
              example: 10000
            },
            creationDate: {
              type: 'string',
              example: '2023-07-19T12:24:11.529Z'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ItemResposta'
              }
            }
          }
        },
        // Esquema de item de resposta
        ItemResposta: {
          type: 'object',
          properties: {
            productId: {
              type: 'integer',
              example: 2434
            },
            quantity: {
              type: 'integer',
              example: 1
            },
            price: {
              type: 'number',
              example: 1000
            }
          }
        },
        // Esquema de resposta de sucesso
        RespostaSucesso: {
          type: 'object',
          properties: {
            sucesso: {
              type: 'boolean',
              example: true
            },
            mensagem: {
              type: 'string',
              example: 'Operação realizada com sucesso!'
            },
            pedido: {
              $ref: '#/components/schemas/PedidoResposta'
            }
          }
        },
        // Esquema de resposta de erro
        RespostaErro: {
          type: 'object',
          properties: {
            sucesso: {
              type: 'boolean',
              example: false
            },
            erro: {
              type: 'object',
              properties: {
                codigo: {
                  type: 'string',
                  example: 'PEDIDO_NAO_ENCONTRADO'
                },
                mensagem: {
                  type: 'string',
                  example: 'Não foi encontrado nenhum pedido com o número informado.'
                }
              }
            }
          }
        }
      }
    }
  },
  // Onde buscar as anotações de documentação
  apis: ['./src/routes/*.js']
};

// Gera a especificação do Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerSpec
};
