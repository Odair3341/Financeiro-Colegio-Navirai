-- Schema do Sistema Financeiro CN
-- Criação de todas as tabelas necessárias

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    cor VARCHAR(7) DEFAULT '#3B82F6',
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas_bancarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    banco VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    tipo VARCHAR(20) DEFAULT 'corrente' CHECK (tipo IN ('corrente', 'poupanca', 'investimento')),
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Despesas
CREATE TABLE IF NOT EXISTS despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    conta_bancaria_id UUID REFERENCES contas_bancarias(id),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    forma_pagamento VARCHAR(50),
    numero_documento VARCHAR(50),
    observacoes TEXT,
    recorrente BOOLEAN DEFAULT false,
    frequencia_recorrencia VARCHAR(20),
    parcela_atual INTEGER DEFAULT 1,
    total_parcelas INTEGER DEFAULT 1,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS receitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    conta_bancaria_id UUID REFERENCES contas_bancarias(id),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'vencido', 'cancelado')),
    forma_recebimento VARCHAR(50),
    numero_documento VARCHAR(50),
    observacoes TEXT,
    recorrente BOOLEAN DEFAULT false,
    frequencia_recorrencia VARCHAR(20),
    parcela_atual INTEGER DEFAULT 1,
    total_parcelas INTEGER DEFAULT 1,
    valor_recebido DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos (para controle de pagamentos parciais)
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    despesa_id UUID REFERENCES despesas(id) ON DELETE CASCADE,
    receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
    valor DECIMAL(15,2) NOT NULL,
    data_pagamento DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    conta_bancaria_id UUID REFERENCES contas_bancarias(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_pagamento_tipo CHECK (
        (despesa_id IS NOT NULL AND receita_id IS NULL) OR
        (despesa_id IS NULL AND receita_id IS NOT NULL)
    )
);

-- Tabela de Conciliação Bancária
CREATE TABLE IF NOT EXISTS conciliacao_bancaria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conta_bancaria_id UUID REFERENCES contas_bancarias(id),
    data_conciliacao DATE NOT NULL,
    saldo_extrato DECIMAL(15,2) NOT NULL,
    saldo_sistema DECIMAL(15,2) NOT NULL,
    diferenca DECIMAL(15,2) GENERATED ALWAYS AS (saldo_extrato - saldo_sistema) STORED,
    observacoes TEXT,
    conciliado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_status ON despesas(status);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON despesas(fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_receitas_data_vencimento ON receitas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_receitas_status ON receitas(status);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON receitas(categoria_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_despesa ON pagamentos(despesa_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_receita ON pagamentos(receita_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contas_bancarias_updated_at BEFORE UPDATE ON contas_bancarias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON despesas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON receitas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conciliacao_updated_at BEFORE UPDATE ON conciliacao_bancaria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar saldo das contas
CREATE OR REPLACE FUNCTION atualizar_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.despesa_id IS NOT NULL THEN
            -- Débito para despesa
            UPDATE contas_bancarias 
            SET saldo_atual = saldo_atual - NEW.valor 
            WHERE id = NEW.conta_bancaria_id;
        ELSIF NEW.receita_id IS NOT NULL THEN
            -- Crédito para receita
            UPDATE contas_bancarias 
            SET saldo_atual = saldo_atual + NEW.valor 
            WHERE id = NEW.conta_bancaria_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.despesa_id IS NOT NULL THEN
            -- Estorna débito
            UPDATE contas_bancarias 
            SET saldo_atual = saldo_atual + OLD.valor 
            WHERE id = OLD.conta_bancaria_id;
        ELSIF OLD.receita_id IS NOT NULL THEN
            -- Estorna crédito
            UPDATE contas_bancarias 
            SET saldo_atual = saldo_atual - OLD.valor 
            WHERE id = OLD.conta_bancaria_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_atualizar_saldo_conta 
    AFTER INSERT OR DELETE ON pagamentos 
    FOR EACH ROW EXECUTE FUNCTION atualizar_saldo_conta();