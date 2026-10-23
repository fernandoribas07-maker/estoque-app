const express = require('express');
const db = require('./database');

const app = express();

// Middleware para interpretar requisições com corpo em JSON
app.use(express.json());

// =========================================================
// 1. ROTA DE RAIZ (Health Check)
// =========================================================
app.get('/', (req, res) => {
  res.json({ mensagem: "API do Controle de Estoque rodando com sucesso! 🚀" });
});

// =========================================================
// 2. ROTAS DE LEITURA DE PRODUTOS (GET)
// =========================================================

// ROTA: Listar todos os produtos
app.get('/produtos', (req, res) => {
  try {
    const produtos = db.prepare(`
      SELECT p.*, c.nome as categoria_nome 
      FROM produtos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `).all();

    res.json(produtos);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    res.status(500).json({ erro: "Erro ao buscar produtos do banco de dados." });
  }
});

// ROTA: Listar produtos com estoque baixo ou zerado
app.get('/produtos/estoque-baixo', (req, res) => {
  try {
    const produtosBaixoEstoque = db.prepare(`
      SELECT p.*, c.nome as categoria_nome 
      FROM produtos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.quantidade_atual <= p.quantidade_minima
    `).all();

    res.json(produtosBaixoEstoque);
  } catch (erro) {
    console.error("Erro ao buscar produtos com estoque baixo:", erro);
    res.status(500).json({ erro: "Erro ao buscar produtos no banco de dados." });
  }
});

// ROTA: Buscar um produto específico pelo ID
app.get('/produtos/:id', (req, res) => {
  try {
    const { id } = req.params;

    const produto = db.prepare(`
      SELECT p.*, c.nome as categoria_nome 
      FROM produtos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `).get(id);

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    res.json(produto);
  } catch (erro) {
    console.error("Erro ao buscar produto por ID:", erro);
    res.status(500).json({ erro: "Erro ao buscar produto no banco de dados." });
  }
});

// =========================================================
// 3. ROTAS DE CATEGORIAS (GET e POST)
// =========================================================

// ROTA: Listar todas as categorias
app.get('/categorias', (req, res) => {
  try {
    const categorias = db.prepare('SELECT * FROM categorias').all();
    res.json(categorias);
  } catch (erro) {
    console.error("Erro ao buscar categorias:", erro);
    res.status(500).json({ erro: "Erro ao buscar categorias do banco de dados." });
  }
});

// ROTA: Cadastrar uma nova categoria
app.post('/categorias', (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ 
        erro: "O campo 'nome' é obrigatório para cadastrar uma categoria." 
      });
    }

    const stmt = db.prepare('INSERT INTO categorias (nome) VALUES (?)');
    const resultado = stmt.run(nome);

    const novaCategoria = db.prepare('SELECT * FROM categorias WHERE id = ?').get(resultado.lastInsertRowid);

    res.status(201).json({
      mensagem: "Categoria cadastrada com sucesso!",
      categoria: novaCategoria
    });
  } catch (erro) {
    console.error("Erro ao cadastrar categoria:", erro);
    res.status(500).json({ erro: "Erro ao cadastrar categoria no banco de dados." });
  }
});

// =========================================================
// 4. ROTA DE CRIAÇÃO DE PRODUTO (POST)
// =========================================================
app.post('/produtos', (req, res) => {
  try {
    const { 
      categoria_id, 
      nome, 
      quantidade_atual, 
      quantidade_minima, 
      unidade_medida, 
      data_validade 
    } = req.body;

    if (!categoria_id || !nome || quantidade_atual === undefined || quantidade_minima === undefined) {
      return res.status(400).json({ 
        erro: "Os campos 'categoria_id', 'nome', 'quantidade_atual' e 'quantidade_minima' são obrigatórios." 
      });
    }

    const stmt = db.prepare(`
      INSERT INTO produtos (categoria_id, nome, quantidade_atual, quantidade_minima, unidade_medida, data_validade)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const resultado = stmt.run(
      categoria_id, 
      nome, 
      quantidade_atual, 
      quantidade_minima, 
      unidade_medida || 'un', 
      data_validade || null
    );

    const novoProduto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(resultado.lastInsertRowid);

    res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto: novoProduto
    });
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro);
    res.status(500).json({ erro: "Erro ao cadastrar produto no banco de dados." });
  }
});

// =========================================================
// 5. ROTA DE ATUALIZAÇÃO (PUT)
// =========================================================
app.put('/produtos/:id/consumir', (req, res) => {
  try {
    const { id } = req.params;

    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    if (produto.quantidade_atual <= 0) {
      return res.status(400).json({ erro: 'O estoque deste produto já está zerado!' });
    }

    const stmt = db.prepare(`
      UPDATE produtos 
      SET quantidade_atual = quantidade_atual - 1 
      WHERE id = ?
    `);
    
    stmt.run(id);

    const produtoAtualizado = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);

    res.json({
      mensagem: 'Baixa realizada com sucesso!',
      produto: produtoAtualizado
    });

  } catch (erro) {
    console.error('Erro ao dar baixa no estoque:', erro);
    res.status(500).json({ erro: 'Erro interno ao atualizar o estoque.' });
  }
});

// =========================================================
// 7. ROTAS DA LISTA DE COMPRAS (GET, POST, PATCH, DELETE)
// =========================================================

// ROTA: Listar todos os itens da lista de compras
app.get('/lista-compras', (req, res) => {
  try {
    const itens = db.prepare('SELECT * FROM lista_compras').all();
    res.json(itens);
  } catch (erro) {
    console.error("Erro ao buscar lista de compras:", erro);
    res.status(500).json({ erro: "Erro ao buscar lista de compras no banco de dados." });
  }
});

// ROTA: Adicionar um item à lista de compras
app.post('/lista-compras', (req, res) => {
  try {
    const { produto_id, nome_item, quantidade_comprar, origem } = req.body;

    if (!nome_item || quantidade_comprar === undefined) {
      return res.status(400).json({ 
        erro: "Os campos 'nome_item' e 'quantidade_comprar' são obrigatórios." 
      });
    }

    const stmt = db.prepare(`
      INSERT INTO lista_compras (produto_id, nome_item, quantidade_comprar, origem)
      VALUES (?, ?, ?, ?)
    `);

    const resultado = stmt.run(
      produto_id || null,
      nome_item,
      quantidade_comprar,
      origem || 'MANUAL'
    );

    const novoItem = db.prepare('SELECT * FROM lista_compras WHERE id = ?').get(resultado.lastInsertRowid);

    res.status(201).json({
      mensagem: "Item adicionado à lista de compras com sucesso!",
      item: novoItem
    });
  } catch (erro) {
    console.error("Erro ao adicionar item na lista de compras:", erro);
    res.status(500).json({ erro: "Erro ao adicionar item no banco de dados." });
  }
});

// ROTA: Alternar status de comprado (0 vira 1, 1 vira 0)
app.patch('/lista-compras/:id/comprar', (req, res) => {
  try {
    const { id } = req.params;

    const item = db.prepare('SELECT * FROM lista_compras WHERE id = ?').get(id);

    if (!item) {
      return res.status(404).json({ erro: "Item não encontrado na lista de compras." });
    }

    const novoStatus = item.comprado === 1 ? 0 : 1;

    db.prepare('UPDATE lista_compras SET comprado = ? WHERE id = ?').run(novoStatus, id);

    const itemAtualizado = db.prepare('SELECT * FROM lista_compras WHERE id = ?').get(id);

    res.json({
      mensagem: "Status do item atualizado com sucesso!",
      item: itemAtualizado
    });
  } catch (erro) {
    console.error("Erro ao atualizar item da lista:", erro);
    res.status(500).json({ erro: "Erro interno ao atualizar item." });
  }
});

// ROTA: Remover item da lista de compras
app.delete('/lista-compras/:id', (req, res) => {
  try {
    const { id } = req.params;

    const item = db.prepare('SELECT * FROM lista_compras WHERE id = ?').get(id);

    if (!item) {
      return res.status(404).json({ erro: "Item não encontrado na lista de compras." });
    }

    db.prepare('DELETE FROM lista_compras WHERE id = ?').run(id);

    res.json({
      mensagem: "Item removido da lista de compras com sucesso!",
      item_removido: item
    });
  } catch (erro) {
    console.error("Erro ao remover item da lista de compras:", erro);
    res.status(500).json({ erro: "Erro ao remover item do banco de dados." });
  }
});

// =========================================================
// 6. ROTA DE EXCLUSÃO (DELETE)
// =========================================================
app.delete('/produtos/:id', (req, res) => {
  try {
    const { id } = req.params;

    const produtoExistente = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);

    if (!produtoExistente) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    db.prepare('DELETE FROM produtos WHERE id = ?').run(id);

    res.json({
      mensagem: "Produto removido do estoque com sucesso!",
      produto_removido: produtoExistente
    });
  } catch (erro) {
    console.error("Erro ao deletar produto:", erro);
    res.status(500).json({ erro: "Erro ao remover produto do banco de dados." });
  }
});

// =========================================================
// INICIALIZAÇÃO DO SERVIDOR (Sempre na última linha!)
// =========================================================
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});