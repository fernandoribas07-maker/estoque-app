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

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});