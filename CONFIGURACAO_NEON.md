# 📋 Guia de Configuração do Sistema Financeiro com Neon PostgreSQL

## 🚀 Configuração Inicial

### 1. Credenciais do Neon
Suas credenciais já foram configuradas no arquivo `.env`:
```
DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Instalação das Dependências
```bash
npm install pg @types/pg
```

### 3. Criação das Tabelas no Banco
Execute o script SQL localizado em `database/schema.sql` no seu banco Neon:

```bash
# Conecte ao seu banco Neon
psql 'postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Execute o script de criação das tabelas
\i database/schema.sql
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas:
- **categorias** - Categorias de receitas e despesas
- **fornecedores** - Fornecedores e clientes
- **contas_bancarias** - Contas bancárias da empresa
- **despesas** - Despesas e contas a pagar
- **receitas** - Receitas e contas a receber
- **pagamentos** - Histórico de pagamentos

### Relacionamentos:
- Despesas → Categorias (categoria_id)
- Despesas → Fornecedores (fornecedor_id)
- Despesas → Contas Bancárias (conta_bancaria_id)
- Pagamentos → Despesas (despesa_id)
- Pagamentos → Receitas (receita_id)

## 📊 Upload de Dados via Excel

### 1. Formato do Arquivo Excel
O sistema aceita arquivos Excel (.xlsx) com as seguintes abas:

#### Aba "Categorias":
| nome | tipo | cor | descricao | ativo |
|------|------|-----|-----------|-------|
| Energia | despesa | #ff0000 | Conta de energia | true |

#### Aba "Fornecedores":
| nome | cnpj | email | telefone | ativo |
|------|------|-------|----------|-------|
| ENERGISA | 12.345.678/0001-90 | contato@energisa.com | (11) 99999-9999 | true |

#### Aba "Despesas":
| descricao | valor | data_vencimento | categoria | fornecedor | status |
|-----------|-------|-----------------|-----------|------------|--------|
| Conta de Energia | 250.50 | 2024-01-15 | Energia | ENERGISA | pendente |

#### Aba "Receitas":
| descricao | valor | data_vencimento | categoria | fornecedor | status |
|-----------|-------|-----------------|-----------|------------|--------|
| Venda de Produto | 1500.00 | 2024-01-10 | Vendas | Cliente ABC | pendente |

### 2. Como Fazer o Upload
1. Acesse a página "Configuração do Banco" no sistema
2. Clique em "Upload de Excel"
3. Selecione seu arquivo Excel
4. Aguarde o processamento
5. Verifique o relatório de importação

## 🔧 Migração de Dados Existentes

### Migração Automática do localStorage
O sistema possui uma funcionalidade de migração automática:

1. Acesse "Configuração do Banco"
2. Clique em "Migrar Dados do localStorage"
3. Confirme a migração
4. Aguarde o processo finalizar

**⚠️ Importante:** Faça backup dos dados antes da migração!

## 🛠️ Comandos Úteis

### Testar Conexão com o Banco
```javascript
import { db } from './src/services/database';

// Testar conexão
const isConnected = await db.testConnection();
console.log('Conexão:', isConnected ? 'OK' : 'Falhou');
```

### Executar Scripts SQL Personalizados
```javascript
import { db } from './src/services/database';

// Executar script personalizado
await db.executeScript(`
  INSERT INTO categorias (nome, tipo, cor, ativo) 
  VALUES ('Nova Categoria', 'despesa', '#00ff00', true);
`);
```

## 📈 Funcionalidades Disponíveis

### ✅ Implementado:
- ✅ Conexão com Neon PostgreSQL
- ✅ CRUD completo para todas as entidades
- ✅ Upload de dados via Excel
- ✅ Migração do localStorage
- ✅ Sistema de pagamentos múltiplos
- ✅ Relatórios financeiros
- ✅ Dashboard com métricas

### 🔄 Sincronização em Tempo Real:
- Todos os dados são salvos automaticamente no banco
- Não há mais dependência do localStorage
- Dados acessíveis de qualquer dispositivo

## 🚨 Troubleshooting

### Erro de Conexão
```
Error: connect ECONNREFUSED
```
**Solução:** Verifique se as credenciais no `.env` estão corretas.

### Erro de SSL
```
Error: self signed certificate
```
**Solução:** Já configurado com `ssl: { rejectUnauthorized: false }`

### Tabelas não encontradas
```
Error: relation "categorias" does not exist
```
**Solução:** Execute o script `database/schema.sql` no seu banco Neon.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Teste a conexão com o banco
3. Confirme se todas as tabelas foram criadas
4. Verifique se o arquivo `.env` está correto

---

**🎉 Parabéns! Seu sistema financeiro está configurado com Neon PostgreSQL!**