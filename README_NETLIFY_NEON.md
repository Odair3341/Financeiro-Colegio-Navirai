# Neon Postgres integration for Netlify deployment

Este guia descreve como configurar o Neon PostgreSQL no ambiente de Netlify, mantendo credenciais seguras e sem expor dados sensíveis no código.

Resumo
- A aplicação lê as variáveis de ambiente através do prefixo VITE_NEON_*.
- Logs de configuração do Neon são impressos apenas em modo de desenvolvimento (DEV).
- Em Netlify, configure as variáveis de ambiente no painel do site.
- Não há necessidade de push direto para o GitHub para este fluxo; Netlify pode consumir as variáveis diretamente do painel de configurações.

1) Variáveis de ambiente no Netlify
Defina as seguintes variáveis em Site Settings > Build & Deploy > Environment:

- VITE_NEON_HOST: Host do Neon (ex.: neon-host.neon)
- VITE_NEON_PORT: 5432 (ou a porta correspondente)
- VITE_NEON_DATABASE: neondb
- VITE_NEON_USERNAME: neondb_owner
- VITE_NEON_PASSWORD: senha segura (não hardcode)
- VITE_NEON_DATABASE_URL: opcional; se estiver usando a URL direta, insira por exemplo:
  postgresql://neondb_owner:senha@neon-host.neon:5432/neondb?sslmode=require&channel_binding=require

Observação: mantenha as credenciais no Netlify como variáveis de ambiente; não as inclua no código.

2) Arquivos de referência para desenvolvimento local
- .env.local.template: referência de como configurar localmente (não comite credenciais).
- .env.local: arquivo real com as credenciais para desenvolvimento.

3) Integração de código (já implementada)
- src/main.tsx:
  - adiciona import './bootstrap/neonLogger'; para rodar logs do Neon em DEV.
- src/bootstrap/neonLogger.ts:
  - roda logNeonConfig() somente em DEV (console seguro).
- src/utils/neonConfig.ts:
  - getNeonConfig(): NeonConfig usando VITE_NEON_*.
  - getNeonConnectionUrl(): URL de conexão (se URL não for fornecida).
- src/utils/neonUsage.ts:
  - logNeonConfig(): imprime host, port, database, user (sem password) em DEV.
- src/pages ImportacaoExcel.tsx:
  - fluxo de integração com Neon permanece seguro; logs diagnósticos adicionados sem expor senhas.

4) Testes
- Local:
  - Inicie a aplicação em DEV (npm run dev) e abra o console do navegador.
  - Verifique o log do Neon Config impresso apenas em DEV.
- Netlify:
  - Faça o deploy com as variáveis configuradas.
  - Verifique os logs de build/deploy para confirmar que a aplicação inicializou com as variáveis carregadas (logs devem aparecer apenas em DEV, se a configuração de produção for respeitada).

5) Segurança
- Nunca exponha credenciais no código ou logs de produção.
- Use .env.local para desenvolvimento.
- Em Netlify, use as variáveis de ambiente do painel, não o .env.local no repositório.

6) Próximos passos (opcional)
- Integrar logNeonConfig no bootstrap de produção apenas se necessário, mantendo logs desativados por padrão.
- Adicionar uma checagem de conexão Neon na UI (opcional) para validação rápida no ambiente de desenvolvimento.
- Documentar no README do projeto como configurar Neon para desenvolvimento e como realizar deploy no Netlify.

Nenhuma modificação adicional obrigatória para já, a menos que deseje integrar checagens extras ou ajustar a estratégia de deploy. Se desejar, posso acrescentar instruções adicionais no README ou criar um utilitário de checagem de conexão para o Netlify.
