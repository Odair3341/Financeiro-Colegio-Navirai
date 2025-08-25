# Configurações para Deploy na Vercel

## Status Atual
- ✅ Build local funcionando
- ✅ Fallback localStorage implementado
- ✅ CSS corrigido
- ✅ Fontes Google carregadas

## Problemas Conhecidos da Vercel
1. **Timeout em conexões externas**: Neon pode demorar para responder
2. **Function limits**: Serverless functions têm limite de tempo
3. **Cold starts**: Primeira execução é sempre mais lenta

## Soluções Implementadas

### 1. Timeout Reduzido
```typescript
// Em neonAPI.ts - timeout de 5s ao invés de 30s
const timeout = 5000;
```

### 2. Fallback Automático
```typescript
// Se Neon falhar, usa localStorage imediatamente
catch (error) {
  console.warn('Neon indisponível, usando localStorage');
  return localData;
}
```

### 3. Configuração Vercel Otimizada
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 10
    }
  }
}
```

## Como Testar

1. **Local**: `npm run build` ✅ (funcionando)
2. **Vercel**: Deploy automático no push
3. **Fallback**: Funciona mesmo se Neon falhar

## URLs para Teste
- **Produção**: https://sistemafinanceirocn.vercel.app
- **Preview**: Gerado automaticamente nos PRs

## Troubleshooting

### Se der erro 500:
1. Ver logs na Vercel Dashboard
2. Verificar se localStorage está sendo usado
3. Checar timeout das funções

### Se der erro 404:
1. Verificar se o push foi feito
2. Checar se o build terminou
3. Ver se as rotas estão corretas

### Se der erro de CSS:
1. ✅ Já corrigido - classes customizadas adicionadas
2. ✅ Fontes Google carregadas
3. ✅ Variáveis CSS do shadcn-ui configuradas