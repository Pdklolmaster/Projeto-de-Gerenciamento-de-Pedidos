/**
 * ============================================
 * CONEXÃO COM O BANCO DE DADOS
 * ============================================
 * 
 * Configura e exporta a conexão com o SQLite usando sql.js.
 * sql.js é uma versão do SQLite compilada para JavaScript puro,
 * não requer compilação nativa.
 * 
 * @author Pablo de Oliveira Silva
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Define o caminho do arquivo do banco de dados
const dbPath = path.join(__dirname, '..', '..', process.env.DATABASE_FILE || 'database.sqlite');

// Variável que armazenará a instância do banco
let db = null;

/**
 * Inicializa o banco de dados
 * Carrega arquivo existente ou cria um novo
 */
async function initDatabase() {
  const SQL = await initSqlJs();
  
  try {
    // Tenta carregar banco existente
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('✅ Banco de dados carregado do arquivo!');
    } else {
      // Cria novo banco
      db = new SQL.Database();
      console.log('✅ Novo banco de dados criado!');
    }
  } catch (error) {
    // Se falhar, cria novo
    db = new SQL.Database();
    console.log('✅ Novo banco de dados criado!');
  }

  // Cria as tabelas
  criarTabelas();
  
  return db;
}

/**
 * Cria as tabelas necessárias
 */
function criarTabelas() {
  // Tabela de Usuários (Users)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      ativo INTEGER DEFAULT 1,
      criadoEm TEXT DEFAULT CURRENT_TIMESTAMP,
      atualizadoEm TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de Pedidos (Order)
  // Estrutura: orderId, value, creationDate
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      orderId TEXT PRIMARY KEY,
      value REAL NOT NULL,
      creationDate TEXT NOT NULL
    )
  `);

  // Tabela de Itens (Items)
  // Estrutura: orderId, productId, quantity, price
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      orderId TEXT NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tabelas criadas com sucesso!');
}

/**
 * Salva o banco de dados no arquivo
 */
function salvarBanco() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

/**
 * Retorna a instância do banco de dados
 */
function getDb() {
  return db;
}

/**
 * Executa uma query SELECT e retorna todos os resultados
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  
  return results;
}

/**
 * Executa uma query SELECT e retorna o primeiro resultado
 */
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Executa uma query INSERT, UPDATE ou DELETE
 */
function run(sql, params = []) {
  db.run(sql, params);
  salvarBanco();
  return { changes: db.getRowsModified() };
}

module.exports = {
  initDatabase,
  getDb,
  queryAll,
  queryOne,
  run,
  salvarBanco
};
