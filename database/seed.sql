-- Dados iniciais para o Sistema Financeiro CN

-- Inserir categorias padrão
INSERT INTO categorias (nome, tipo, cor, descricao) VALUES
('Energia Elétrica', 'despesa', '#EF4444', 'Contas de energia elétrica'),
('Água e Esgoto', 'despesa', '#3B82F6', 'Contas de água e esgoto'),
('Telefone/Internet', 'despesa', '#8B5CF6', 'Contas de telefone e internet'),
('Combustível', 'despesa', '#F59E0B', 'Gastos com combustível'),
('Alimentação', 'despesa', '#10B981', 'Gastos com alimentação'),
('Material de Escritório', 'despesa', '#6B7280', 'Material de escritório e suprimentos'),
('Manutenção', 'despesa', '#F97316', 'Serviços de manutenção'),
('Impostos', 'despesa', '#DC2626', 'Impostos e taxas'),
('Salários', 'despesa', '#1F2937', 'Folha de pagamento'),
('Vendas', 'receita', '#059669', 'Receitas de vendas'),
('Serviços', 'receita', '#0D9488', 'Receitas de prestação de serviços'),
('Juros', 'receita', '#7C3AED', 'Receitas financeiras'),
('Outras Receitas', 'receita', '#2563EB', 'Outras receitas diversas')
ON CONFLICT (nome) DO NOTHING;

-- Inserir fornecedores padrão
INSERT INTO fornecedores (nome, cnpj, email, telefone) VALUES
('ENERGISA', '00.000.000/0001-00', 'atendimento@energisa.com.br', '0800-123-4567'),
('COMPESA', '11.111.111/0001-11', 'contato@compesa.com.br', '0800-765-4321'),
('OI S.A.', '22.222.222/0001-22', 'empresas@oi.com.br', '0800-555-0199'),
('VIVO S.A.', '33.333.333/0001-33', 'corporativo@vivo.com.br', '0800-555-0155'),
('Posto Ipiranga', '44.444.444/0001-44', 'contato@ipiranga.com.br', '(11) 3333-4444'),
('Supermercado Extra', '55.555.555/0001-55', 'fornecedores@extra.com.br', '(11) 5555-6666'),
('Papelaria Central', '66.666.666/0001-66', 'vendas@papelaria.com.br', '(11) 7777-8888'),
('Oficina do João', '77.777.777/0001-77', 'joao@oficina.com.br', '(11) 9999-0000')
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir contas bancárias padrão
INSERT INTO contas_bancarias (nome, banco, agencia, conta, tipo, saldo_inicial, saldo_atual) VALUES
('Conta Corrente Principal', 'Banco do Brasil', '1234-5', '12345-6', 'corrente', 10000.00, 10000.00),
('Conta Poupança', 'Caixa Econômica', '5678-9', '98765-4', 'poupanca', 5000.00, 5000.00),
('Conta Investimento', 'Itaú', '9876-5', '54321-0', 'investimento', 15000.00, 15000.00)
ON CONFLICT DO NOTHING;

-- Inserir algumas despesas de exemplo
INSERT INTO despesas (descricao, valor, data_vencimento, categoria_id, fornecedor_id, status, forma_pagamento) 
SELECT 
    'Conta de Energia - Janeiro 2025',
    450.00,
    '2025-01-15',
    c.id,
    f.id,
    'pendente',
    'Débito Automático'
FROM categorias c, fornecedores f 
WHERE c.nome = 'Energia Elétrica' AND f.nome = 'ENERGISA'
ON CONFLICT DO NOTHING;

INSERT INTO despesas (descricao, valor, data_vencimento, categoria_id, fornecedor_id, status, forma_pagamento) 
SELECT 
    'Conta de Água - Janeiro 2025',
    120.00,
    '2025-01-10',
    c.id,
    f.id,
    'pendente',
    'Boleto'
FROM categorias c, fornecedores f 
WHERE c.nome = 'Água e Esgoto' AND f.nome = 'COMPESA'
ON CONFLICT DO NOTHING;

-- Inserir algumas receitas de exemplo
INSERT INTO receitas (descricao, valor, data_vencimento, categoria_id, status, forma_recebimento) 
SELECT 
    'Venda de Produtos - Janeiro 2025',
    2500.00,
    '2025-01-30',
    c.id,
    'pendente',
    'Transferência Bancária'
FROM categorias c 
WHERE c.nome = 'Vendas'
ON CONFLICT DO NOTHING;

INSERT INTO receitas (descricao, valor, data_vencimento, categoria_id, status, forma_recebimento) 
SELECT 
    'Prestação de Serviços - Janeiro 2025',
    1800.00,
    '2025-01-25',
    c.id,
    'pendente',
    'PIX'
FROM categorias c 
WHERE c.nome = 'Serviços'
ON CONFLICT DO NOTHING;