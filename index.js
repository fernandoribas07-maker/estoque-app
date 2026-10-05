const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());

// ROTA DE TESTE
app.get('/', (req, res) => {
  res.json({ mensagem: "API do Controle de Estoque rodando com sucesso! 🚀" });
});

// ROTA DE PRODUTOS
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

// ROTA: Dar baixa de 1 unidade no estoque do produto
app.put('/produtos/:id/consumir', (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca o produto atual para verificar se existe e qual a quantidade atual
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);

    // Validação 1: Produto não encontrado
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Validação 2: Produto já zerado
    if (produto.quantidade_atual <= 0) {
      return res.status(400).json({ erro: 'O estoque deste produto já está zerado!' });
    }

    // 2. Decrementa 1 unidade do estoque no SQLite
    const stmt = db.prepare(`
      UPDATE produtos 
      SET quantidade_atual = quantidade_atual - 1 
      WHERE id = ?
    `);
    
    stmt.run(id);

    // 3. Retorna o produto atualizado com a nova quantidade
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

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});