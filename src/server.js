/**
 * ============================================
 * SERVIDOR PRINCIPAL DA API DE PEDIDOS
 * ============================================
 * 
 * Este arquivo configura e inicializa o servidor Express.
 * Responsável por carregar middlewares, rotas e tratamento de erros.
 * 
 */

// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importação das rotas
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

// Importação dos middlewares
const errorHandler = require('./middlewares/errorHandler');
const { autenticar } = require('./middlewares/auth');

// Importação da documentação Swagger
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Importação da inicialização do banco de dados
const { initDatabase } = require('./database/connection');

// Criação da aplicação Express
const app = express();

// ===========================================
// CONFIGURAÇÃO DE MIDDLEWARES
// ===========================================

// Helmet: adiciona cabeçalhos de segurança HTTP
app.use(helmet());

// CORS: permite requisições de diferentes origens
app.use(cors());

// Analisador JSON: converte o corpo das requisições para JSON
app.use(express.json());

// ===========================================
// DOCUMENTAÇÃO DA API (SWAGGER)
// ===========================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Pedidos - Documentação'
}));

// ===========================================
// ROTAS DA API
// ===========================================

// Rota de verificação de saúde da API
app.get('/', (req, res) => {
  res.status(200).json({
    sucesso: true,
    mensagem: 'API de Pedidos está funcionando!',
    versao: '1.0.0',
    documentacao: '/api-docs'
  });
});

// Rotas de autenticação (públicas)
app.use('/auth', authRoutes);

// Rotas de pedidos (protegidas por autenticação JWT)
app.use('/order', autenticar, orderRoutes);

// ===========================================
// TRATAMENTO DE ROTAS NÃO ENCONTRADAS
// ===========================================

app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: {
      codigo: 'ROTA_NAO_ENCONTRADA',
      mensagem: `A rota ${req.method} ${req.originalUrl} não existe nesta API.`,
      sugestao: 'Verifique a documentação em /api-docs para ver as rotas disponíveis.'
    }
  });
});

// ===========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ===========================================

app.use(errorHandler);

// ===========================================
// INICIALIZAÇÃO DO SERVIDOR
// ===========================================

const PORT = process.env.PORT || 3000;

// Inicializa o banco de dados antes de iniciar o servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('   🚀 API DE PEDIDOS');
    console.log('========================================');
    console.log(`   ✅ Servidor rodando na porta ${PORT}`);
    console.log(`   📚 Documentação: http://localhost:${PORT}/api-docs`);
    console.log(`   🔗 API Base: http://localhost:${PORT}/order`);
    console.log('========================================\n');
  });
}).catch((erro) => {
  console.error('❌ Erro ao inicializar o banco de dados:', erro);
  process.exit(1);
});

module.exports = app;
