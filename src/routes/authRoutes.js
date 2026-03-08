/**
 * ============================================
 * ROTAS DE AUTENTICAÇÃO
 * ============================================
 * 
 * Define as rotas para registro, login e verificação de token.
 * 
 * @author Pablo de Oliveira Silva
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Importação do controller de autenticação
const AuthController = require('../controllers/AuthController');

// Importação do middleware de autenticação
const { autenticar } = require('../middlewares/auth');

// Importação da validação
const { verificarValidacao } = require('../middlewares/validators');

// ===========================================
// VALIDAÇÕES
// ===========================================

const validarRegistro = [
  body('nome')
    .notEmpty()
    .withMessage('O campo "nome" é obrigatório.')
    .isLength({ min: 3 })
    .withMessage('O nome deve ter pelo menos 3 caracteres.'),
  
  body('email')
    .notEmpty()
    .withMessage('O campo "email" é obrigatório.')
    .isEmail()
    .withMessage('O email informado não é válido.'),
  
  body('senha')
    .notEmpty()
    .withMessage('O campo "senha" é obrigatório.')
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres.'),
  
  verificarValidacao
];

const validarLogin = [
  body('email')
    .notEmpty()
    .withMessage('O campo "email" é obrigatório.')
    .isEmail()
    .withMessage('O email informado não é válido.'),
  
  body('senha')
    .notEmpty()
    .withMessage('O campo "senha" é obrigatório.'),
  
  verificarValidacao
];

// ===========================================
// ROTAS DE AUTENTICAÇÃO
// ===========================================

/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria um novo usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário (único)
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 description: Senha (mínimo 6 caracteres)
 *                 example: "senha123"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */
router.post('/registrar', validarRegistro, AuthController.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuário
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 mensagem:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Email ou senha incorretos
 */
router.post('/login', validarLogin, AuthController.login);

/**
 * @swagger
 * /auth/verificar:
 *   get:
 *     summary: Verificar token
 *     description: Verifica se o token JWT é válido
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido ou expirado
 */
router.get('/verificar', autenticar, AuthController.verificar);

module.exports = router;
