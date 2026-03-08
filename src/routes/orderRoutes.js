/**
 * ============================================
 * ROTAS DE PEDIDOS
 * ============================================
 * 
 * Define todas as rotas relacionadas aos pedidos.
 * Cada rota está documentada com Swagger para geração automática da documentação.
 * 
 * @author Pablo de Oliveira Silva
 */

const express = require('express');
const router = express.Router();

// Importação do controller de pedidos
const OrderController = require('../controllers/OrderController');

// Importação das validações
const { 
  validarCriacaoPedido, 
  validarAtualizacaoPedido 
} = require('../middlewares/validators');

// ===========================================
// ROTAS DE PEDIDOS
// ===========================================

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Criar um novo pedido
 *     description: |
 *       Cria um novo pedido no sistema. 
 *       O sistema realiza a transformação automática dos campos de português para inglês.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoEntrada'
 *           example:
 *             numeroPedido: "v10089015vdb-01"
 *             valorTotal: 10000
 *             dataCriacao: "2023-07-19T12:24:11.5299601+00:00"
 *             items:
 *               - idItem: "2434"
 *                 quantidadeItem: 1
 *                 valorItem: 1000
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: Dados inválidos na requisição
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaErro'
 *       401:
 *         description: Token não fornecido ou inválido
 *       409:
 *         description: Pedido já existe com este número
 */
router.post('/', validarCriacaoPedido, OrderController.criar);

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Listar todos os pedidos
 *     description: Retorna uma lista com todos os pedidos cadastrados
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 pedidos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PedidoResposta'
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get('/list', OrderController.listarTodos);

/**
 * @swagger
 * /order/{numeroPedido}:
 *   get:
 *     summary: Obter dados de um pedido
 *     description: Retorna os dados completos de um pedido específico pelo número
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numeroPedido
 *         required: true
 *         description: Número único do pedido
 *         schema:
 *           type: string
 *         example: v10089016vdb
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResposta'
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/:numeroPedido', OrderController.buscarPorId);

/**
 * @swagger
 * /order/{numeroPedido}:
 *   put:
 *     summary: Atualizar um pedido
 *     description: Atualiza os dados de um pedido existente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numeroPedido
 *         required: true
 *         description: Número único do pedido a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoEntrada'
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:numeroPedido', validarAtualizacaoPedido, OrderController.atualizar);

/**
 * @swagger
 * /order/{numeroPedido}:
 *   delete:
 *     summary: Deletar um pedido
 *     description: Remove um pedido do sistema permanentemente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numeroPedido
 *         required: true
 *         description: Número único do pedido a ser deletado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido deletado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.delete('/:numeroPedido', OrderController.deletar);

module.exports = router;
