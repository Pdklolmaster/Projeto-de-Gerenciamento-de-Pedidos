/**
 * ============================================
 * MIDDLEWARE DE TRATAMENTO DE ERROS
 * ============================================
 * 
 * Centraliza o tratamento de todos os erros da aplicação.
 * Garante respostas consistentes e mensagens compreensíveis.
 * 
 * @author Pablo de Oliveira Silva
 */

const AppError = require('../utils/AppError');

/**
 * Middleware global de tratamento de erros
 * 
 * Este middleware captura todos os erros que ocorrem na aplicação
 * e retorna uma resposta JSON formatada de forma consistente.
 * 
 * @param {Error} erro - Objeto de erro
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const errorHandler = (erro, req, res, next) => {
  // Registro do erro para depuração (em produção, usar um sistema de logs apropriado)
  console.error('\n❌ ERRO CAPTURADO:');
  console.error(`   Rota: ${req.method} ${req.originalUrl}`);
  console.error(`   Mensagem: ${erro.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`   Pilha de chamadas: ${erro.stack}`);
  }

  // Se for um erro operacional (AppError), usa suas propriedades
  if (erro instanceof AppError) {
    return res.status(erro.statusCode).json({
      sucesso: false,
      erro: {
        codigo: erro.codigo,
        mensagem: erro.message
      }
    });
  }

  // Tratamento de erros de validação do express-validator
  if (erro.array && typeof erro.array === 'function') {
    return res.status(400).json({
      sucesso: false,
      erro: {
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Os dados enviados são inválidos.',
        detalhes: erro.array()
      }
    });
  }

  // Tratamento de erros de JSON malformado
  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({
      sucesso: false,
      erro: {
        codigo: 'JSON_INVALIDO',
        mensagem: 'O corpo da requisição contém JSON inválido. Verifique a sintaxe.'
      }
    });
  }

  // Tratamento de erros do SQLite
  if (erro.code && erro.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      sucesso: false,
      erro: {
        codigo: 'ERRO_BANCO_DADOS',
        mensagem: 'Ocorreu um erro ao acessar o banco de dados. Tente novamente.'
      }
    });
  }

  // Erro genérico/inesperado (500 - Erro Interno do Servidor)
  res.status(500).json({
    sucesso: false,
    erro: {
      codigo: 'ERRO_INTERNO',
      mensagem: 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.',
      // Em desenvolvimento, mostra mais detalhes
      ...(process.env.NODE_ENV === 'development' && { 
        detalhes: erro.message,
        pilhaChamadas: erro.stack 
      })
    }
  });
};

module.exports = errorHandler;
