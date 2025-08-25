# 🚂 Guia de Deploy - Railway

## Sistema Financeiro CN - Configuração para Railway

### 📋 Pré-requisitos
- Conta no [Railway](https://railway.app)
- Repositório Git (GitHub, GitLab)
- Banco de dados Neon configurado

### 🔧 Configuração Passo a Passo

#### 1. Preparação do Projeto

```bash
# Clone o repositório
git clone <seu-repositorio>
cd sistema-financeiro-cn

# Instale as dependências
npm install

# Teste o build local
npm run build
```

#### 2. Deploy via GitHub

1. **Conecte seu repositório:**
   - Acesse [Railway Dashboard](https://railway.app/dashboard)
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte sua conta GitHub
   - Selecione o repositório

2. **Configuração automática:**
   - Railway detecta automaticamente que é um projeto Vite
   - Build command: `npm run build`
   - Start command: `npm run preview` (ou configure um servidor estático)

#### 3. Configuração Manual (railway.json)

Crie o arquivo `railway.json` na raiz do projeto:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 4. Configuração de Variáveis de Ambiente

No painel do Railway:

1. Vá para seu projeto → **Variables**
2. Adicione as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Aplicação
NODE_ENV=production
VITE_NODE_ENV=production
VITE_APP_URL=https://seu-app.up.railway.app
VITE_API_URL=https://seu-app.up.railway.app/api

# Segurança
VITE_ENABLE_HTTPS=true
VITE_SECURE_COOKIES=true
VITE_CORS_ORIGIN=https://seu-app.up.railway.app

# Railway específicas
PORT=3000
RAILWAY_STATIC_URL=https://seu-app.up.railway.app
```

#### 5. Configuração de Servidor Estático

Para servir arquivos estáticos, adicione ao `package.json`:

```json
{
  "scripts": {
    "preview": "vite preview --host 0.0.0.0 --port $PORT",
    "start": "vite preview --host 0.0.0.0 --port $PORT"
  }
}
```

Ou use um servidor Express simples. Crie `server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Configurar SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
```

E adicione express às dependências:

```json
{
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

#### 6. Deploy via CLI

```bash
# Instale o Railway CLI
npm install -g @railway/cli

# Faça login
railway login

# Inicialize o projeto
railway init

# Deploy
railway up
```

#### 7. Configuração de Domínio Customizado

1. **No painel Railway:**
   - Vá para **Settings** → **Domains**
   - Clique em "Custom Domain"
   - Digite seu domínio
   - Configure os DNS records (CNAME)

2. **SSL/TLS:**
   - Railway fornece SSL gratuito
   - Configurado automaticamente

### 🔒 Configurações de Segurança

#### Headers de Segurança
Adicione middleware no `server.js`:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.neon.tech"]
    }
  }
}));
```

#### CORS
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.VITE_CORS_ORIGIN || 'https://seu-app.up.railway.app',
  credentials: true
}));
```

### 📊 Monitoramento

#### Logs
- Acesse **Deployments** → **Logs** no painel
- Use `railway logs` via CLI

#### Métricas
- CPU, Memória, Rede no painel
- Uptime monitoring

### 🚨 Troubleshooting

#### Problemas Comuns

1. **Build falha:**
   ```bash
   # Verifique o Nixpacks
   railway run npm run build
   ```

2. **Porta não configurada:**
   - Certifique-se de usar `process.env.PORT`
   - Bind em `0.0.0.0`, não `localhost`

3. **Variáveis de ambiente:**
   - Redeploy após adicionar variáveis
   - Use `railway run env` para testar

4. **Timeout de deploy:**
   - Aumente `healthcheckTimeout`
   - Verifique logs de startup

### 📈 Otimizações

#### Performance
- Railway CDN (automático)
- Compressão (configure no servidor)
- Cache headers

#### Build
- Build cache (automático)
- Incremental builds
- Preview deployments

### 💰 Custos

- **Hobby (Gratuito):**
  - $5 crédito/mês
  - 500 horas de execução
  - 1GB RAM, 1 vCPU

- **Pro ($20/mês):**
  - $20 crédito/mês
  - Recursos ilimitados
  - Priority support

### 🔧 Configurações Avançadas

#### Auto-scaling
```json
{
  "deploy": {
    "replicas": {
      "min": 1,
      "max": 3
    }
  }
}
```

#### Health Checks
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  }
}
```

### 🔗 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Nixpacks](https://nixpacks.com)
- [Environment Variables](https://docs.railway.app/develop/variables)

---

**✅ Checklist de Deploy:**

- [ ] Repositório Git configurado
- [ ] `railway.json` criado (opcional)
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente
- [ ] Projeto criado no Railway
- [ ] Deploy realizado com sucesso
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL ativado
- [ ] Banco Neon funcionando
- [ ] Logs verificados
- [ ] Testes de funcionalidade realizados