/**
 * ============================================
 * CONTROLLER DE AUTENTICAÇÃO
 * ============================================
 * 
 * Gerencia registro e login de usuários.
 * Utiliza JWT (JSON Web Token) para autenticação.
 * 
 * @author Pablo de Oliveira Silva
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, run } = require('../database/connection');
const AppError = require('../utils/AppError');

/**
 * Controller de Autenticação
 * Gerencia registro e login de usuários
 */
const AuthController = {

  /**
   * REGISTRAR NOVO USUÁRIO
   * POST /auth/registrar
   * 
   * Cria um novo usuário no sistema.
   * A senha é criptografada antes de ser salva.
   */
  registrar: async (req, res, next) => {
    try {
      const { nome, email, senha } = req.body;

      // Verifica se já existe usuário com este email
      const usuarioExistente = queryOne(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (usuarioExistente) {
        throw new AppError(
          'EMAIL_JA_CADASTRADO',
          'Já existe um usuário cadastrado com este email.',
          409 // Conflito
        );
      }

      // Criptografa a senha (10 rounds de salt)
      const senhaCriptografada = await bcrypt.hash(senha, 10);

      // Insere o novo usuário
      run(
        'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
        [nome, email, senhaCriptografada]
      );

      // Busca o usuário criado para retornar os dados
      const novoUsuario = queryOne(
        'SELECT id, nome, email, criadoEm FROM users WHERE email = ?',
        [email]
      );

      // Retorna sucesso (201 - Criado)
      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário registrado com sucesso!',
        usuario: novoUsuario
      });

    } catch (erro) {
      next(erro);
    }
  },

  /**
   * LOGIN DE USUÁRIO
   * POST /auth/login
   * 
   * Autentica um usuário e retorna um token JWT.
   */
  login: async (req, res, next) => {
    try {
      const { email, senha } = req.body;

      // Busca o usuário pelo email
      const usuario = queryOne(
        'SELECT id, nome, email, senha, ativo FROM users WHERE email = ?',
        [email]
      );

      // Verifica se o usuário existe
      if (!usuario) {
        throw new AppError(
          'CREDENCIAIS_INVALIDAS',
          'Email ou senha incorretos.',
          401 // Não autorizado
        );
      }

      // Verifica se o usuário está ativo
      if (!usuario.ativo) {
        throw new AppError(
          'USUARIO_INATIVO',
          'Este usuário está desativado. Entre em contato com o suporte.',
          403 // Proibido
        );
      }

      // Verifica se a senha está correta
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        throw new AppError(
          'CREDENCIAIS_INVALIDAS',
          'Email ou senha incorretos.',
          401 // Não autorizado
        );
      }

      // Gera o token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          nome: usuario.nome
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Retorna o token (200 - Sucesso)
      res.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });

    } catch (erro) {
      next(erro);
    }
  },

  /**
   * VERIFICAR TOKEN
   * GET /auth/verificar
   * 
   * Verifica se o token do usuário é válido.
   * Útil para verificar se a sessão ainda está ativa.
   */
  verificar: (req, res) => {
    // Se chegou aqui, o token é válido (passou pelo middleware)
    res.status(200).json({
      sucesso: true,
      mensagem: 'Token válido!',
      usuario: req.usuario
    });
  }
};

module.exports = AuthController;
