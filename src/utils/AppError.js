/**
 * ============================================
 * CLASSE DE ERRO PERSONALIZADA
 * ============================================
 * 
 * Permite criar erros com código, mensagem e status HTTP.
 * Facilita o tratamento de erros de forma padronizada.
 * 
 * @author Pablo de Oliveira Silva
 */

class AppError extends Error {
  /**
   * Cria um novo erro personalizado
   * 
   * @param {string} codigo - Código único do erro (ex: 'PEDIDO_NAO_ENCONTRADO')
   * @param {string} mensagem - Mensagem descritiva do erro
   * @param {number} statusCode - Código HTTP (ex: 400, 404, 500)
   */
  constructor(codigo, mensagem, statusCode = 400) {
    super(mensagem);
    
    this.codigo = codigo;
    this.statusCode = statusCode;
    this.isOperacional = true; // Indica que é um erro esperado/tratável
    
    // Captura a pilha de chamadas para depuração
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
