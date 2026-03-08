/**
 * ============================================
 * VALIDADORES DE REQUISIÇÃO
 * ============================================
 * 
 * Middlewares de validação usando express-validator.
 * Valida os dados de entrada antes de processá-los.
 * 
 * @author Pablo de Oliveira Silva
 */

const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware que verifica os resultados da validação
 * e retorna erros formatados se houver problemas
 */
const verificarValidacao = (req, res, next) => {
  const erros = validationResult(req);
  
  if (!erros.isEmpty()) {
    const mensagensErro = erros.array().map(erro => erro.msg).join(' ');
    
    return res.status(400).json({
      sucesso: false,
      erro: {
        codigo: 'VALIDACAO_FALHOU',
        mensagem: 'Os dados enviados são inválidos.',
        detalhes: erros.array().map(erro => ({
          campo: erro.path,
          mensagem: erro.msg,
          valorRecebido: erro.value
        }))
      }
    });
  }
  
  next();
};

/**
 * Validação para criação de pedido
 * POST /order
 */
const validarCriacaoPedido = [
  // Valida numeroPedido
  body('numeroPedido')
    .notEmpty()
    .withMessage('O campo "numeroPedido" é obrigatório.')
    .isString()
    .withMessage('O campo "numeroPedido" deve ser uma string.')
    .trim(),

  // Valida valorTotal
  body('valorTotal')
    .notEmpty()
    .withMessage('O campo "valorTotal" é obrigatório.')
    .isNumeric()
    .withMessage('O campo "valorTotal" deve ser um número.')
    .custom(value => value >= 0)
    .withMessage('O campo "valorTotal" não pode ser negativo.'),

  // Valida dataCriacao
  body('dataCriacao')
    .notEmpty()
    .withMessage('O campo "dataCriacao" é obrigatório.')
    .isISO8601()
    .withMessage('O campo "dataCriacao" deve estar no formato ISO 8601 (ex: 2023-07-19T12:24:11Z).'),

  // Valida items (array)
  body('items')
    .isArray({ min: 1 })
    .withMessage('O campo "items" é obrigatório e deve conter pelo menos um item.'),

  // Valida cada item do array
  body('items.*.idItem')
    .notEmpty()
    .withMessage('Cada item deve ter um "idItem".'),

  body('items.*.quantidadeItem')
    .notEmpty()
    .withMessage('Cada item deve ter uma "quantidadeItem".')
    .isInt({ min: 1 })
    .withMessage('A "quantidadeItem" deve ser um número inteiro maior que zero.'),

  body('items.*.valorItem')
    .notEmpty()
    .withMessage('Cada item deve ter um "valorItem".')
    .isNumeric()
    .withMessage('O "valorItem" deve ser um número.'),

  // Middleware final que verifica os erros
  verificarValidacao
];

/**
 * Validação para atualização de pedido
 * PUT /order/:numeroPedido
 * 
 * Similar à criação, mas alguns campos podem ser opcionais
 */
const validarAtualizacaoPedido = [
  // Valida valorTotal (se fornecido)
  body('valorTotal')
    .optional()
    .isNumeric()
    .withMessage('O campo "valorTotal" deve ser um número.')
    .custom(value => value >= 0)
    .withMessage('O campo "valorTotal" não pode ser negativo.'),

  // Valida dataCriacao (se fornecida)
  body('dataCriacao')
    .optional()
    .isISO8601()
    .withMessage('O campo "dataCriacao" deve estar no formato ISO 8601.'),

  // Valida items (se fornecido)
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('O campo "items" deve ser um array com pelo menos um item.'),

  // Middleware final
  verificarValidacao
];

module.exports = {
  validarCriacaoPedido,
  validarAtualizacaoPedido,
  verificarValidacao
};
