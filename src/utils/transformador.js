/**
 * ============================================
 * TRANSFORMADOR DE DADOS
 * ============================================
 * 
 * Responsável por transformar os dados entre os formatos:
 * - Entrada (PT-BR): formato recebido pela API
 * - Banco (EN): formato armazenado no banco de dados
 * 
 * Demonstra capacidade de mapeamento e transformação de dados.
 * 
 * @author Pablo de Oliveira Silva
 */

/**
 * Transforma dados de entrada (PT-BR) para formato do banco (EN)
 * 
 * Entrada (recebido):
 * {
 *   "numeroPedido": "v10089015vdb-01",
 *   "valorTotal": 10000,
 *   "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
 *   "items": [
 *     { "idItem": "2434", "quantidadeItem": 1, "valorItem": 1000 }
 *   ]
 * }
 * 
 * Saída (banco):
 * {
 *   "orderId": "v10089015vdb-01",
 *   "value": 10000,
 *   "creationDate": "2023-07-19T12:24:11.529Z",
 *   "items": [
 *     { "productId": 2434, "quantity": 1, "price": 1000 }
 *   ]
 * }
 * 
 * @param {Object} dadosEntrada - Dados recebidos no formato PT-BR
 * @returns {Object} Dados transformados para formato EN
 */
function transformarEntradaParaBanco(dadosEntrada) {
  // Validação básica dos campos obrigatórios
  if (!dadosEntrada.numeroPedido) {
    throw new Error('O campo "numeroPedido" é obrigatório.');
  }

  // Transforma a data para formato ISO padronizado
  const dataOriginal = dadosEntrada.dataCriacao;
  let dataFormatada = dataOriginal;
  
  try {
    // Converte para Date e volta para ISO string (normaliza o formato)
    const dataObj = new Date(dataOriginal);
    if (!isNaN(dataObj.getTime())) {
      dataFormatada = dataObj.toISOString();
    }
  } catch (e) {
    // Mantém a data original se houver erro na conversão
    dataFormatada = dataOriginal;
  }

  // Monta o objeto transformado
  const dadosTransformados = {
    // Mapeia: numeroPedido -> orderId
    orderId: dadosEntrada.numeroPedido,
    
    // Mapeia: valorTotal -> value
    value: dadosEntrada.valorTotal,
    
    // Mapeia: dataCriacao -> creationDate (normalizada)
    creationDate: dataFormatada,
    
    // Mapeia itens
    items: transformarItens(dadosEntrada.items || [])
  };

  return dadosTransformados;
}

/**
 * Transforma array de itens de PT-BR para EN
 * 
 * @param {Array} itens - Array de itens no formato PT-BR
 * @returns {Array} Array de itens no formato EN
 */
function transformarItens(itens) {
  return itens.map((item, index) => {
    // Valida se o item possui os campos necessários
    if (!item.idItem) {
      throw new Error(`O item na posição ${index + 1} não possui "idItem".`);
    }

    return {
      // Mapeia: idItem -> productId (convertido para número)
      productId: parseInt(item.idItem, 10),
      
      // Mapeia: quantidadeItem -> quantity
      quantity: item.quantidadeItem || 1,
      
      // Mapeia: valorItem -> price
      price: item.valorItem || 0
    };
  });
}

/**
 * Transforma dados do banco (EN) para formato de saída (PT-BR)
 * Útil caso queira retornar os dados no mesmo formato de entrada
 * 
 * @param {Object} dadosBanco - Dados no formato do banco
 * @returns {Object} Dados no formato PT-BR
 */
function transformarBancoParaSaida(dadosBanco) {
  return {
    numeroPedido: dadosBanco.orderId,
    valorTotal: dadosBanco.value,
    dataCriacao: dadosBanco.creationDate,
    items: (dadosBanco.items || []).map(item => ({
      idItem: String(item.productId),
      quantidadeItem: item.quantity,
      valorItem: item.price
    }))
  };
}

module.exports = {
  transformarEntradaParaBanco,
  transformarBancoParaSaida,
  transformarItens
};
