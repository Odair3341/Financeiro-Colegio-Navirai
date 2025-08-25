# 🎨 Guia de Deploy - Render

## Sistema Financeiro CN - Configuração para Render

### 📋 Pré-requisitos
- Conta no [Render](https://render.com)
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
   - Acesse [Render Dashboard](https://dashboard.render.com)
   - Clique em "New +" → "Static Site"
   - Conecte sua conta GitHub/GitLab
   - Selecione o repositório

2. **Configurações de Build:**
   - Name: `sistema-financeiro-cn`
   - Branch: `main` (ou sua branch principal)
   - Build Command: `npm run build`
   - Publish Directory: `dist`

#### 3. Configuração via render.yaml

Crie o arquivo `render.yaml` na raiz do projeto:

```yaml
services:
  - type: web
    name: sistema-financeiro-cn
    env: static
    buildCommand: npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-XSS-Protection
        value: 1; mode=block
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
      - path: /*
        name: Referrer-Policy
        value: strict-origin-when-cross-origin
      - path: /*
        name: Content-Security-Policy
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.neon.tech;"
      - path: /assets/*
        name: Cache-Control
        value: public, max-age=31536000, immutable
    envVars:
      - key: NODE_ENV
        value: production
      - key: VITE_NODE_ENV
        value: production
      - key: VITE_DATABASE_URL
        sync: false
      - key: VITE_APP_URL
        sync: false
      - key: VITE_API_URL
        sync: false
      - key: VITE_ENABLE_HTTPS
        value: true
      - key: VITE_SECURE_COOKIES
        value: true
```

#### 4. Configuração de Variáveis de Ambiente

No painel do Render:

1. Vá para seu serviço → **Environment**
2. Adicione as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Aplicação
NODE_ENV=production
VITE_NODE_ENV=production
VITE_APP_URL=https://seu-app.onrender.com
VITE_API_URL=https://seu-app.onrender.com/api

# Segurança
VITE_ENABLE_HTTPS=true
VITE_SECURE_COOKIES=true
VITE_CORS_ORIGIN=https://seu-app.onrender.com

# Build
NODE_VERSION=18
NPM_VERSION=9
```

#### 5. Deploy com Web Service (Alternativo)

Para maior controle, use um Web Service com Express:

1. **Crie `server.js`:**

```javascript
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

// Middleware de segurança
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

// CORS
app.use(cors({
  origin: process.env.VITE_CORS_ORIGIN,
  credentials: true
}));

// Compressão
app.use(compression());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: false
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
```

2. **Atualize `package.json`:**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.js",
    "build": "npm run build && npm run start"
  }
}
```

3. **Configure como Web Service:**
   - Type: Web Service
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

#### 6. Configuração de Domínio Customizado

1. **No painel Render:**
   - Vá para **Settings** → **Custom Domains**
   - Clique em "Add Custom Domain"
   - Digite seu domínio
   - Configure os DNS records

2. **SSL/TLS:**
   - Render fornece SSL gratuito via Let's Encrypt
   - Configurado automaticamente

### 🔒 Configurações de Segurança

#### Headers de Segurança
Já configurados no `render.yaml` ou `server.js`

#### CORS
Configurado via middleware Express ou variáveis de ambiente

### 📊 Monitoramento

#### Logs
- Acesse **Logs** no painel do serviço
- Logs em tempo real
- Filtros por nível de log

#### Métricas
- CPU, Memória, Requests no painel
- Uptime monitoring
- Performance insights

### 🚨 Troubleshooting

#### Problemas Comuns

1. **Build falha:**
   ```bash
   # Verifique dependências
   npm ci
   npm run build
   ```

2. **Static site não carrega SPA routes:**
   - Configure redirects no `render.yaml`
   - Use Web Service com Express

3. **Variáveis de ambiente:**
   - Redeploy após adicionar variáveis
   - Verifique se começam com `VITE_`

4. **Timeout de build:**
   - Otimize dependências
   - Use cache de build

### 📈 Otimizações

#### Performance
- Render CDN (automático)
- Compressão Gzip/Brotli
- Cache headers configurados

#### Build
- Build cache (automático)
- Incremental builds
- Preview deployments

### 💰 Custos

- **Free Tier:**
  - 750 horas/mês
  - 100GB bandwidth
  - SSL gratuito
  - Sleep após inatividade

- **Starter ($7/mês):**
  - Sem sleep
  - 100GB bandwidth
  - Priority support

### 🔧 Configurações Avançadas

#### Auto-deploy
- Deploy automático no push
- Preview deployments para PRs
- Branch-specific deploys

#### Health Checks
```yaml
healthCheckPath: /health
```

#### Environment Groups
- Compartilhe variáveis entre serviços
- Gerencie configurações centralizadas

### 🔗 Links Úteis

- [Render Docs](https://render.com/docs)
- [Static Sites](https://render.com/docs/static-sites)
- [Web Services](https://render.com/docs/web-services)
- [Environment Variables](https://render.com/docs/environment-variables)

---

**✅ Checklist de Deploy:**

- [ ] Repositório Git configurado
- [ ] `render.yaml` criado (opcional)
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente
- [ ] Serviço criado no Render
- [ ] Deploy realizado com sucesso
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL ativado
- [ ] Banco Neon funcionando
- [ ] Health checks funcionando
- [ ] Logs verificados
- [ ] Testes de funcionalidade realizados