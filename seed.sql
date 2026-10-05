-- 1. CATEGORIAS
INSERT INTO categorias (nome, cor_hex) VALUES
('Laticínios', '#3B82F6'),
('Grãos e Cereais', '#F59E0B'),
('Limpeza', '#10B981'),
('Higiene Pessoal', '#EC4899');

-- 2. PRODUTOS DA DESPENSA
INSERT INTO produtos (categoria_id, nome, quantidade_atual, quantidade_minima, unidade_medida, data_validade) VALUES
(1, 'Leite Integral 1L', 2, 4, 'un', '2026-10-25'),
(1, 'Manteiga com Sal 200g', 1, 1, 'un', '2026-11-10'),
(2, 'Arroz Branco 5kg', 0, 1, 'pacote', '2027-01-15'),
(2, 'Feijão Carioca 1kg', 3, 2, 'pacote', '2026-12-01'),
(3, 'Detergente Neutro 500ml', 1, 2, 'un', NULL);

-- 3. ITENS NA LISTA DE COMPRAS
INSERT INTO lista_compras (produto_id, nome_item, quantidade_comprar, comprado, origem) VALUES
(1, 'Leite Integral 1L', 2, 0, 'AUTOMATICO'),
(3, 'Arroz Branco 5kg', 1, 0, 'AUTOMATICO'),
(NULL, 'Banana Prata', 1, 0, 'MANUAL');