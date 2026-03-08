/**
 * ============================================
 * CONTROLLER DE PEDIDOS
 * ============================================
 * 
 * Contém toda a lógica de negócio para operações com pedidos.
 * Responsável por:
 * - Transformar dados de entrada (PT-BR) para formato de banco (EN)
 * - Validar regras de negócio
 * - Interagir com o banco de dados
 * 
 * @author Pablo de Oliveira Silva
 */

const { queryOne, queryAll, run } = require('../database/connection');
const { transformarEntradaParaBanco, transformarBancoParaSaida } = require('../utils/transformador');
const AppError = require('../utils/AppError');

/**
 * Controller de Pedidos
 * Gerencia todas as operações CRUD de pedidos
 */
const OrderController = {

  /**
   * CRIAR NOVO PEDIDO
   * POST /order
   * 
   * Recebe os dados em português, transforma para inglês e salva no banco.
   * Resposta HTTP: 201 (Criado) em caso de sucesso
   */
  criar: (req, res, next) => {
    try {
      const dadosEntrada = req.body;
      
      // Transforma os dados de PT-BR para EN (formato do banco)
      const dadosTransformados = transformarEntradaParaBanco(dadosEntrada);
      
      // Verifica se já existe um pedido com este ID
      const pedidoExistente = queryOne(
        'SELECT orderId FROM orders WHERE orderId = ?',
        [dadosTransformados.orderId]
      );
      
      if (pedidoExistente) {
        throw new AppError(
          'PEDIDO_JA_EXISTE',
          `Já existe um pedido cadastrado com o número "${dadosTransformados.orderId}".`,
          409 // Conflito
        );
      }

      // Insere o pedido principal
      run(
        'INSERT INTO orders (orderId, value, creationDate) VALUES (?, ?, ?)',
        [dadosTransformados.orderId, dadosTransformados.value, dadosTransformados.creationDate]
      );

      // Insere os itens do pedido
      for (const item of dadosTransformados.items) {
        run(
          'INSERT INTO items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
          [dadosTransformados.orderId, item.productId, item.quantity, item.price]
        );
      }

      // Retorna resposta de sucesso (201 - Criado)
      res.status(201).json({
        sucesso: true,
        mensagem: 'Pedido criado com sucesso!',
        pedido: dadosTransformados
      });

    } catch (erro) {
      next(erro);
    }
  },

  /**
   * BUSCAR PEDIDO POR ID
   * GET /order/:numeroPedido
   * 
   * Busca um pedido específico pelo número.
   * Resposta HTTP: 200 (Sucesso) ou 404 (Não Encontrado)
   */
  buscarPorId: (req, res, next) => {
    try {
      const { numeroPedido } = req.params;

      // Busca o pedido no banco
      const pedido = queryOne(
        'SELECT orderId, value, creationDate FROM orders WHERE orderId = ?',
        [numeroPedido]
      );

      // Se não encontrou, retorna erro 404
      if (!pedido) {
        throw new AppError(
          'PEDIDO_NAO_ENCONTRADO',
          `Não foi encontrado nenhum pedido com o número "${numeroPedido}".`,
          404
        );
      }

      // Busca os itens do pedido
      const items = queryAll(
        'SELECT productId, quantity, price FROM items WHERE orderId = ?',
        [numeroPedido]
      );

      // Monta o objeto de resposta
      const pedidoCompleto = {
        ...pedido,
        items
      };

      // Retorna o pedido encontrado (200 - Sucesso)
      res.status(200).json({
        sucesso: true,
        pedido: pedidoCompleto
      });

    } catch (erro) {
      next(erro);
    }
  },

  /**
   * LISTAR TODOS OS PEDIDOS
   * GET /order/list
   * 
   * Retorna todos os pedidos cadastrados.
   * Resposta HTTP: 200 (Sucesso)
   */
  listarTodos: (req, res, next) => {
    try {
      // Busca todos os pedidos
      const pedidos = queryAll(
        'SELECT orderId, value, creationDate FROM orders ORDER BY creationDate DESC'
      );

      // Para cada pedido, busca seus itens
      const pedidosComItens = pedidos.map(pedido => {
        const items = queryAll(
          'SELECT productId, quantity, price FROM items WHERE orderId = ?',
          [pedido.orderId]
        );

        return { ...pedido, items };
      });

      // Retorna a lista (200 - Sucesso)
      res.status(200).json({
        sucesso: true,
        total: pedidosComItens.length,
        pedidos: pedidosComItens
      });

    } catch (erro) {
      next(erro);
    }
  },

  /**
   * ATUALIZAR PEDIDO
   * PUT /order/:numeroPedido
   * 
   * Atualiza os dados de um pedido existente.
   * Resposta HTTP: 200 (Sucesso) ou 404 (Não Encontrado)
   */
  atualizar: (req, res, next) => {
    try {
      const { numeroPedido } = req.params;
      const dadosEntrada = req.body;

      // Verifica se o pedido existe
      const pedidoExistente = queryOne(
        'SELECT orderId FROM orders WHERE orderId = ?',
        [numeroPedido]
      );

      if (!pedidoExistente) {
        throw new AppError(
          'PEDIDO_NAO_ENCONTRADO',
          `Não foi encontrado nenhum pedido com o número "${numeroPedido}" para atualizar.`,
          404
        );
      }

      // Transforma os dados de entrada
      const dadosTransformados = transformarEntradaParaBanco(dadosEntrada);

      // Atualiza o pedido principal
      run(
        'UPDATE orders SET value = ?, creationDate = ? WHERE orderId = ?',
        [dadosTransformados.value, dadosTransformados.creationDate, numeroPedido]
      );

      // Remove itens antigos
      run('DELETE FROM items WHERE orderId = ?', [numeroPedido]);

      // Insere novos itens
      for (const item of dadosTransformados.items) {
        run(
          'INSERT INTO items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
          [numeroPedido, item.productId, item.quantity, item.price]
        );
      }

      // Retorna sucesso (200 - Sucesso)
      res.status(200).json({
        sucesso: true,
        mensagem: `Pedido "${numeroPedido}" atualizado com sucesso!`,
        pedido: { orderId: numeroPedido, ...dadosTransformados }
      });

    } catch (erro) {
      next(erro);
    }
  },

  /**
   * DELETAR PEDIDO
   * DELETE /order/:numeroPedido
   * 
   * Remove um pedido do sistema permanentemente.
   * Resposta HTTP: 200 (Sucesso) ou 404 (Não Encontrado)
   */
  deletar: (req, res, next) => {
    try {
      const { numeroPedido } = req.params;

      // Verifica se o pedido existe
      const pedidoExistente = queryOne(
        'SELECT orderId FROM orders WHERE orderId = ?',
        [numeroPedido]
      );

      if (!pedidoExistente) {
        throw new AppError(
          'PEDIDO_NAO_ENCONTRADO',
          `Não foi encontrado nenhum pedido com o número "${numeroPedido}" para deletar.`,
          404
        );
      }

      // Deleta os itens primeiro
      run('DELETE FROM items WHERE orderId = ?', [numeroPedido]);
      
      // Deleta o pedido
      run('DELETE FROM orders WHERE orderId = ?', [numeroPedido]);

      // Retorna sucesso (200 - Sucesso)
      res.status(200).json({
        sucesso: true,
        mensagem: `Pedido "${numeroPedido}" foi deletado com sucesso!`
      });

    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = OrderController;
