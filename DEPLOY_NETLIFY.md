# 🚀 Guia de Deploy - Netlify

## Sistema Financeiro CN - Configuração para Netlify

### 📋 Pré-requisitos
- Conta no [Netlify](https://netlify.com)
- Repositório Git (GitHub, GitLab, Bitbucket)
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

#### 2. Configuração do netlify.toml

Crie o arquivo `netlify.toml` na raiz do projeto:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.neon.tech;"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### 3. Deploy via Git

1. **Conecte seu repositório:**
   - Acesse [Netlify Dashboard](https://app.netlify.com)
   - Clique em "New site from Git"
   - Conecte seu provedor Git (GitHub/GitLab/Bitbucket)
   - Selecione o repositório

2. **Configurações de Build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

#### 4. Configuração de Variáveis de Ambiente

No painel do Netlify:

1. Vá para **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_DATABASE_URL=postgresql://neondb_owner:npg_jf4zxkh2AUgB@ep-dawn-king-acewwr1k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Aplicação
NODE_ENV=production
VITE_NODE_ENV=production
VITE_APP_URL=https://seu-site.netlify.app
VITE_API_URL=https://seu-site.netlify.app/api

# Segurança
VITE_ENABLE_HTTPS=true
VITE_SECURE_COOKIES=true
VITE_CORS_ORIGIN=https://seu-site.netlify.app
```

#### 5. Deploy Manual (Alternativo)

```bash
# Instale o Netlify CLI
npm install -g netlify-cli

# Faça login
netlify login

# Build e deploy
npm run build
netlify deploy --prod --dir=dist
```

#### 6. Configuração de Domínio Customizado

1. **No painel Netlify:**
   - Vá para **Domain settings**
   - Clique em **Add custom domain**
   - Digite seu domínio
   - Configure os DNS records

2. **SSL/TLS:**
   - O Netlify fornece SSL gratuito via Let's Encrypt
   - Será configurado automaticamente

### 🔒 Configurações de Segurança

#### Headers de Segurança (já incluídos no netlify.toml)
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- X-Content-Type-Options

#### CORS
O CORS é configurado automaticamente via variáveis de ambiente.

### 📊 Monitoramento

#### Analytics
- Netlify Analytics (pago)
- Google Analytics (gratuito)
- Plausible Analytics (alternativa)

#### Logs
- Acesse **Functions** → **Logs** no painel
- Use `netlify logs` via CLI

### 🚨 Troubleshooting

#### Problemas Comuns

1. **Build falha:**
   ```bash
   # Verifique as dependências
   npm ci
   npm run build
   ```

2. **Variáveis de ambiente não funcionam:**
   - Certifique-se que começam com `VITE_`
   - Redeploy após adicionar variáveis

3. **Roteamento SPA não funciona:**
   - Verifique se o redirect está configurado no `netlify.toml`

4. **Problemas de CORS:**
   - Verifique `VITE_CORS_ORIGIN`
   - Configure headers no `netlify.toml`

### 📈 Otimizações

#### Performance
- Netlify CDN (automático)
- Compressão Gzip/Brotli (automático)
- Cache de assets (configurado)

#### Build
- Build cache (automático)
- Incremental builds
- Deploy previews

### 💰 Custos

- **Starter (Gratuito):**
  - 100GB bandwidth/mês
  - 300 build minutes/mês
  - Deploy automático

- **Pro ($19/mês):**
  - 1TB bandwidth
  - 25,000 build minutes
  - Analytics
  - Forms

### 🔗 Links Úteis

- [Netlify Docs](https://docs.netlify.com)
- [Netlify CLI](https://cli.netlify.com)
- [Build Settings](https://docs.netlify.com/configure-builds/overview)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview)

---

**✅ Checklist de Deploy:**

- [ ] Repositório Git configurado
- [ ] `netlify.toml` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente
- [ ] Site conectado no Netlify
- [ ] Deploy realizado com sucesso
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL ativado
- [ ] Banco Neon funcionando
- [ ] Testes de funcionalidade realizados