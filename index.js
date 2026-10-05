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
// 2. ROTAS DE LEITURA (GET)
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
// (Nota: Deve vir antes de qualquer rota com parâmetro /produtos/:id)
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

// =========================================================
// 3. ROTA DE CRIAÇÃO (POST)
// =========================================================

// ROTA: Cadastrar um novo produto
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

    // Validação dos campos obrigatórios
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
// 4. ROTA DE ATUALIZAÇÃO (PUT)
// =========================================================

// ROTA: Dar baixa de 1 unidade no estoque do produto
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
// 5. ROTA DE EXCLUSÃO (DELETE)
// =========================================================

// ROTA: Deletar um produto pelo ID
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

