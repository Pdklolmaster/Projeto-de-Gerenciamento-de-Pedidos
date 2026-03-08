/**
 * ============================================
 * MIDDLEWARE DE AUTENTICAÇÃO JWT
 * ============================================
 * 
 * Verifica se a requisição possui um token JWT válido.
 * Protege rotas que requerem autenticação.
 * 
 * @author Pablo de Oliveira Silva
 */

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Middleware de autenticação
 * 
 * Verifica se o token JWT é válido e adiciona os dados
 * do usuário ao objeto de requisição (req.usuario).
 * 
 * @param {Request} req - Objeto de requisição Express
 * @param {Response} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const autenticar = (req, res, next) => {
  try {
    // Obtém o header de autorização
    const authHeader = req.headers.authorization;

    // Verifica se o header existe
    if (!authHeader) {
      throw new AppError(
        'TOKEN_NAO_FORNECIDO',
        'Token de autenticação não fornecido. Faça login para obter um token.',
        401 // Não autorizado
      );
    }

    // O token deve estar no formato "Bearer <token>"
    const partes = authHeader.split(' ');

    if (partes.length !== 2) {
      throw new AppError(
        'TOKEN_MAL_FORMATADO',
        'Token mal formatado. Use o formato: Bearer <token>',
        401
      );
    }

    const [esquema, token] = partes;

    // Verifica se começa com "Bearer"
    if (!/^Bearer$/i.test(esquema)) {
      throw new AppError(
        'TOKEN_MAL_FORMATADO',
        'Token mal formatado. Use o formato: Bearer <token>',
        401
      );
    }

    // Verifica e decodifica o token
    jwt.verify(token, process.env.JWT_SECRET, (erro, decoded) => {
      if (erro) {
        // Token expirado
        if (erro.name === 'TokenExpiredError') {
          throw new AppError(
            'TOKEN_EXPIRADO',
            'Seu token expirou. Faça login novamente para obter um novo token.',
            401
          );
        }

        // Token inválido
        throw new AppError(
          'TOKEN_INVALIDO',
          'Token de autenticação inválido.',
          401
        );
      }

      // Adiciona os dados do usuário ao request
      req.usuario = {
        id: decoded.id,
        email: decoded.email,
        nome: decoded.nome
      };

      // Continua para a próxima função
      return next();
    });

  } catch (erro) {
    next(erro);
  }
};

/**
 * Middleware opcional de autenticação
 * 
 * Tenta autenticar, mas não bloqueia se não houver token.
 * Útil para rotas que podem funcionar com ou sem autenticação.
 */
const autenticarOpcional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Se não tiver header, continua sem autenticação
    if (!authHeader) {
      return next();
    }

    // Tenta autenticar normalmente
    autenticar(req, res, next);

  } catch (erro) {
    // Se falhar, continua sem autenticação
    next();
  }
};

module.exports = {
  autenticar,
  autenticarOpcional
};
