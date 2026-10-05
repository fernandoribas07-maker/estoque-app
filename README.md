Manual de Arquitetura e Documentação TécnicaEstoque Doméstico & Lista de Compras Inteligente (API Backend)1. 🎯 Visão Geral do ProjetoO Estoque Doméstico é uma aplicação focada no gerenciamento eficiente de itens residenciais e geração automatizada de listas de compras. O objetivo do sistema é permitir o controle de consumo de insumos, monitorar datas de validade e emitir alertas automáticos quando os produtos atingirem a quantidade mínima estabelecida.2. 🛠️ Tecnogias, Ferramentas e EcossistemaCategoriaTecnologia / FerramentaFinalidade no SistemaAmbiente de ExecuçãoNode.js (v20+)Plataforma backend para execução do JavaScript no servidor.LinguagemJavaScript (CommonJS)Linguagem de programação principal do ecossistema Node.Framework WebExpress.js (v5)Gerenciamento de rotas HTTP, requisições e respostas JSON.Banco de DadosSQLite3 (Arquivo estoque.db)Banco de dados relacional embarcado, leve e sem necessidade de servidor externo.Driver do Bancobetter-sqlite3Biblioteca síncrona e de altíssimo desempenho para operações SQL em Node.js.Controle de VersãoGitControle de versão local, histórico de commits e checkpoints.Repositório RemotoGitHubHospedagem do código-fonte na nuvem (fernandoribas07-maker/estoque-app).Gerenciador de PacotesnpmGerenciamento de dependências (dependencies e devDependencies).Live ReloadingNodemonReinicialização automática do servidor backend a cada salvamento de arquivo.IDE / EditorVisual Studio CodeAmbiente de desenvolvimento integrado com terminal embutido.Sistema OperacionalmacOSAmbiente de desenvolvimento local.3. 🏗️ Arquitetura de Arquivos e Estrutura do ProjetoPlaintextestoque-app/
├── node_modules/         # Dependências instaladas pelo npm (Ignorado pelo Git)
├── .gitignore            # Arquivo de regras de exclusão do controle de versão
├── database.js           # Módulo de conexão e inicialização do SQLite
├── estoque.db            # Arquivo físico do banco de dados (Ignorado pelo Git)
├── index.js              # Ponto de entrada (Entry point) da API Express
├── package-lock.json     # Árvore exata de versões das dependências
├── package.json          # Manifesto do projeto, scripts e dependências
├── schema.sql            # Script de criação das tabelas (DDL)
└── seed.sql              # Script de povoamento inicial de dados (DML)
4. 🗄️ Modelagem do Banco de Dados Relacional (MER)O sistema utiliza duas tabelas relacionais conectadas por Chave Estrangeira (Foreign Key) para garantir a integridade e categorização dos produtos.Tabela 1: categoriasColunaTipoRestriçõesDescriçãoidINTEGERPRIMARY KEY AUTOINCREMENTIdentificador único da categoria.nomeTEXTNOT NULL UNIQUENome da categoria (ex: Laticínios, Limpeza).Tabela 2: produtosColunaTipoRestriçõesDescriçãoidINTEGERPRIMARY KEY AUTOINCREMENTIdentificador único do produto.categoria_idINTEGERFOREIGN KEY -> categorias(id)Vínculo com a tabela de categorias.nomeTEXTNOT NULLNome completo do produto (ex: Leite Integral 1L).quantidade_atualINTEGERNOT NULL DEFAULT 0Saldo atual no estoque.quantidade_minimaINTEGERNOT NULL DEFAULT 1Limiar para alerta de estoque baixo.unidade_medidaTEXTNOT NULL DEFAULT 'un'Unidade de controle (un, kg, pacote, litro).data_validadeDATENULLData de vencimento do lote atual.criado_emDATETIMEDEFAULT CURRENT_TIMESTAMPData/hora de inserção do registro.5. 🔌 Especificação da API REST (Endpoints Implementados)1. Listar Todos os ProdutosRota: GET /produtosDescrição: Retorna a lista de todos os produtos cadastrados com o nome da respectiva categoria acoplado via LEFT JOIN.Formato de Resposta (Status 200 OK):JSON[
  {
    "id": 1,
    "categoria_id": 1,
    "nome": "Leite Integral 1L",
    "quantidade_atual": 2,
    "quantidade_minima": 4,
    "unidade_medida": "un",
    "data_validade": "2026-10-25",
    "criado_em": "2026-10-05 14:13:31",
    "categoria_nome": "Laticínios"
  }
]
6. 🚀 Manual de Instalação e Execução LocalClonar o Repositório:Bashgit clone https://github.com/fernandoribas07-maker/estoque-app.git
cd estoque-app
Instalar Dependências:Bashnpm install
Inicializar o Banco de Dados:Execute a criação e o povoamento do banco SQLite via scripts de inicialização.Iniciar o Servidor em Modo de Desenvolvimento:Bashnpm run dev
O servidor estará acessível em: http://localhost:3000/produtos📝 [Para anotação no Tablet]======================================================
      MANUAL DE DOCUMENTAÇÃO TÉCNICA DO SISTEMA
======================================================

 [ IMPORTÂNCIA DA DOCUMENTAÇÃO ]
  • Registra as decisões de arquitetura e tecnologias.
  • Serve como arquivo README.md para o repositório GitHub.
  • Permite onboarding imediato de qualquer desenvolvedor.

 [ ATUALIZAÇÃO CONTÍNUA ]
  Conforme criarmos novas rotas (PUT /consumir, POST /produtos,
  DELETE), vamos adicionando as especificações a este manual!
======================================================