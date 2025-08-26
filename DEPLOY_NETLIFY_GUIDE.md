# Deploy no Netlify - Sistema Financeiro CN

## Visão Geral

Este guia explica como fazer o deploy do Sistema Financeiro CN no Netlify, incluindo a configuração do banco de dados Neon PostgreSQL.

## Pré-requisitos

- Conta no [Netlify](https://netlify.com)
- Conta no [Neon](https://neon.tech) (para banco de dados PostgreSQL)
- Repositório no GitHub com o código do projeto

## Configuração do Banco Neon

### 1. Configurar Senha no Neon

1. Acesse seu projeto no Neon Dashboard
2. Vá para **Settings** > **Database**
3. Configure uma senha forte para o usuário `neondb_owner`
4. Anote a string de conexão completa

### 2. String de Conexão

A string de conexão do seu projeto Neon é:
```
postgresql://neondb_owner:SUA_SENHA_AQUI@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Substitua `SUA_SENHA_AQUI` pela senha que você configurou no Neon.**

## Deploy no Netlify

### 1. Conectar Repositório

1. Acesse [Netlify Dashboard](https://app.netlify.com)
2. Clique em **"New site from Git"**
3. Conecte com GitHub e selecione o repositório `Financeiro-Colegio-Navirai`
4. Configure as seguintes opções:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. Configurar Variáveis de Ambiente

No Netlify Dashboard, vá para **Site settings** > **Environment variables** e adicione:

```bash
# Configuração principal do banco
DATABASE_URL=postgresql://neondb_owner:SUA_SENHA@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Configurações específicas do Neon
NEON_HOST=ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech
NEON_DATABASE=neondb
NEON_USERNAME=neondb_owner
NEON_PASSWORD=SUA_SENHA_AQUI
NEON_SSL_MODE=require

# Para o frontend (com prefixo VITE_)
VITE_DATABASE_URL=postgresql://neondb_owner:SUA_SENHA@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_NEON_HOST=ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech
VITE_NEON_DATABASE=neondb
VITE_NEON_USERNAME=neondb_owner
VITE_NEON_PASSWORD=SUA_SENHA_AQUI
```

**⚠️ IMPORTANTE**: Substitua `SUA_SENHA` pela senha real configurada no Neon.

### 3. Configurações Avançadas

O arquivo `netlify.toml` já está configurado com:

- ✅ Redirects para SPA (Single Page Application)
- ✅ Headers de segurança
- ✅ Cache otimizado para assets
- ✅ Configurações de build para Vite
- ✅ CSP (Content Security Policy) configurado para Neon

## Verificação do Deploy

### 1. Build Local

Antes do deploy, teste localmente:

```bash
# Instalar dependências
npm install

# Verificar lint e build
npm run check

# Testar localmente
npm run dev
```

### 2. Deploy Automático

Após configurar:

1. Faça push das alterações para o GitHub
2. O Netlify detectará automaticamente e iniciará o build
3. Acompanhe o progresso no Netlify Dashboard

### 3. Verificar Funcionamento

Após o deploy:

1. Acesse a URL fornecida pelo Netlify
2. Teste as funcionalidades principais:
   - ✅ Carregamento da página inicial
   - ✅ Navegação entre páginas
   - ✅ Funcionalidades do sistema financeiro
   - ✅ Conexão com banco Neon (se configurado)

## Solução de Problemas

### Build Falha

1. Verifique os logs no Netlify Dashboard
2. Teste o build localmente: `npm run build`
3. Verifique se todas as dependências estão no `package.json`

### Erro de Conexão com Banco

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se a senha do Neon está correta
3. Teste a conexão diretamente no Neon Dashboard

### Páginas 404

1. Verifique se o arquivo `netlify.toml` está no repositório
2. Confirme se os redirects estão configurados corretamente

## Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Verificação completa
npm run check

# Preview do build
npm run preview
```

## Recursos Adicionais

- [Documentação do Netlify](https://docs.netlify.com)
- [Documentação do Neon](https://neon.tech/docs)
- [Guia de SPA no Netlify](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)

---

**Nota**: O sistema está configurado para funcionar tanto com banco de dados (Neon) quanto sem (usando localStorage). A configuração do banco é opcional e pode ser habilitada posteriormente.