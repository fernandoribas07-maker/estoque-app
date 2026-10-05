const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 1. Cria ou abre o arquivo físico do banco de dados SQLite
const db = new Database('estoque.db', { verbose: console.log });

// 2. Função para inicializar as tabelas (schema.sql) e os dados iniciais (seed.sql)
function inicializarBanco() {
  // Lê o conteúdo do arquivo schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
    console.log('✅ Tabelas criadas/verificadas com sucesso!');
  }

  // Verifica se a tabela de produtos está vazia antes de rodar o seed.sql
  const totalProdutos = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
  
  if (totalProdutos.total === 0) {
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
      console.log('🌱 Dados de teste (seed.sql) inseridos com sucesso!');
    }
  }
}

// Executa a inicialização
inicializarBanco();

// Exporta a conexão 'db' para ser usada nas rotas da API
module.exports = db;