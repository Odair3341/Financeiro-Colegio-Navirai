# 🌊 Guia de Deploy - DigitalOcean App Platform

## Sistema Financeiro CN - Configuração para DigitalOcean

### 📋 Pré-requisitos
- Conta no [DigitalOcean](https://digitalocean.com)
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
   - Acesse [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - Clique em "Create App"
   - Conecte sua conta GitHub/GitLab
   - Selecione o repositório

2. **Configurações de Build:**
   - Source Type: GitHub
   - Branch: `main`
   - Autodeploy: Enabled

#### 3. Configuração via .do/app.yaml

Crie o arquivo `.do/app.yaml` na raiz do projeto:

```yaml
name: sistema-financeiro-cn
services:
- name: web
  source_dir: /
  github:
    repo: seu-usuario/sistema-financeiro-cn
    branch: main
    deploy_on_push: true
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  build_command: npm run build
  http_port: 8080
  routes:
  - path: /
  health_check:
    http_path: /
    initial_delay_seconds: 10
    period_seconds: 10
    timeout_seconds: 5
    success_threshold: 1
    failure_threshold: 3
  envs:
  - key: NODE_ENV
    value: production
  - key: VITE_NODE_ENV
    value: production
  - key: VITE_DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: VITE_APP_URL
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: VITE_API_URL
    scope: RUN_AND_BUILD_TIME
    type: SECRET
  - key: VITE_ENABLE_HTTPS
    value: "true"
  - key: VITE_SECURE_COOKIES
    value: "true"
  - key: VITE_CORS_ORIGIN
    scope: RUN_AND_BUILD_TIME
    type: SECRET
```

#### 4. Configuração de Servidor Express

Crie `server.js` para servir a aplicação:

```javascript
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.neon.tech"],
      fontSrc: ["'self'", "data:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.VITE_CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compressão
app.use(compression());

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes (se necessário)
app.get('/api/status', (req, res) => {
  res.json({ status: 'API funcionando', timestamp: new Date().toISOString() });
});

// SPA routing - deve ser o último
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro:', err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${port}`);
});
```

#### 5. Atualize package.json

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
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### 6. Configuração de Variáveis de Ambiente

No painel do DigitalOcean:

1. Vá para sua App → **Settings** → **App-Level Environment Variables**
2. Adicione as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Aplicação
NODE_ENV=production
VITE_NODE_ENV=production
VITE_APP_URL=https://seu-app.ondigitalocean.app
VITE_API_URL=https://seu-app.ondigitalocean.app/api

# Segurança
VITE_ENABLE_HTTPS=true
VITE_SECURE_COOKIES=true
VITE_CORS_ORIGIN=https://seu-app.ondigitalocean.app

# Sistema
PORT=8080
```

#### 7. Deploy via CLI (Alternativo)

```bash
# Instale o doctl
# Windows: choco install doctl
# macOS: brew install doctl
# Linux: snap install doctl

# Configure a autenticação
doctl auth init

# Crie a app
doctl apps create --spec .do/app.yaml

# Liste as apps
doctl apps list

# Atualize a app
doctl apps update <app-id> --spec .do/app.yaml
```

#### 8. Configuração de Domínio Customizado

1. **No painel DigitalOcean:**
   - Vá para sua App → **Settings** → **Domains**
   - Clique em "Add Domain"
   - Digite seu domínio
   - Configure os DNS records

2. **SSL/TLS:**
   - DigitalOcean fornece SSL gratuito via Let's Encrypt
   - Configurado automaticamente

### 🔒 Configurações de Segurança

#### Firewall
- Configure Cloud Firewalls no DigitalOcean
- Permita apenas tráfego HTTP/HTTPS

#### Secrets Management
- Use App-Level Environment Variables para secrets
- Nunca commite credenciais no código

### 📊 Monitoramento

#### Logs
- Acesse **Runtime Logs** no painel da App
- Use `doctl apps logs <app-id>` via CLI

#### Métricas
- CPU, Memória, Requests no painel
- Uptime monitoring
- Alertas configuráveis

#### Insights
- Performance metrics
- Error tracking
- Request analytics

### 🚨 Troubleshooting

#### Problemas Comuns

1. **Build falha:**
   ```bash
   # Verifique dependências
   npm ci
   npm run build
   ```

2. **App não inicia:**
   - Verifique se `PORT` está configurado
   - Bind em `0.0.0.0`, não `localhost`
   - Verifique health check endpoint

3. **Variáveis de ambiente:**
   - Redeploy após adicionar variáveis
   - Verifique scope (BUILD_TIME vs RUN_TIME)

4. **Timeout de health check:**
   - Aumente `initial_delay_seconds`
   - Verifique endpoint `/health`

### 📈 Otimizações

#### Performance
- DigitalOcean CDN (adicional)
- Compressão configurada
- Cache headers otimizados

#### Scaling
```yaml
instance_count: 2
instance_size_slug: basic-xs
```

#### Auto-scaling
```yaml
autoscaling:
  min_instance_count: 1
  max_instance_count: 3
  metrics:
  - type: cpu
    target: 70
```

### 💰 Custos

- **Basic ($5/mês):**
  - 512MB RAM, 1 vCPU
  - 1TB bandwidth
  - SSL incluído

- **Professional ($12/mês):**
  - 1GB RAM, 1 vCPU
  - 1TB bandwidth
  - Alertas avançados

### 🔧 Configurações Avançadas

#### Database Integration
- DigitalOcean Managed Databases
- Connection pooling
- Backup automático

#### CDN
```yaml
static_sites:
- name: assets
  source_dir: dist/assets
  catchall_document: index.html
```

### 🔗 Links Úteis

- [DigitalOcean Apps Docs](https://docs.digitalocean.com/products/app-platform)
- [App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec)
- [doctl CLI](https://docs.digitalocean.com/reference/doctl)
- [Environment Variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables)

---

**✅ Checklist de Deploy:**

- [ ] Repositório Git configurado
- [ ] `.do/app.yaml` criado
- [ ] `server.js` configurado
- [ ] Dependências a