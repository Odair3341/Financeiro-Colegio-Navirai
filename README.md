# Sistema Financeiro CN

<!-- Deploy trigger: $(date +%Y%m%d_%H%M%S) -->

Um sistema completo de gestão financeira pessoal desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- **Dashboard Financeiro**: Visão geral de receitas, despesas e saldo
- **Gestão de Categorias**: Criação e organização de categorias personalizadas
- **Controle de Despesas**: Registro e acompanhamento de gastos
- **Gestão de Receitas**: Controle de entradas financeiras
- **Relatórios**: Análises e gráficos financeiros
- **Armazenamento Local**: Funciona offline usando localStorage
- **Integração Neon PostgreSQL**: Suporte opcional para banco de dados na nuvem

## 🔗 Links do Projeto

**Repositório**: https://github.com/Odair3341/Sistema-Financeiro-Cn.git
**Lovable Project**: https://lovable.dev/projects/d3062d5f-f421-4e2d-8b97-26841c35dc77

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d3062d5f-f421-4e2d-8b97-26841c35dc77) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 Deploy

### Deploy na Vercel (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as seguintes variáveis de ambiente (opcionais):
   ```
   VITE_DATABASE_URL=sua_url_do_neon_postgresql
   ```
3. O deploy será automático a cada push na branch `main`

### Deploy via Lovable

Alternativamente, abra [Lovable](https://lovable.dev/projects/d3062d5f-f421-4e2d-8b97-26841c35dc77) e clique em Share -> Publish.

## 💾 Configuração do Banco de Dados

O sistema funciona de duas formas:

1. **Modo Offline (Padrão)**: Usa localStorage para armazenar dados localmente
2. **Modo Online (Opcional)**: Conecta ao Neon PostgreSQL para sincronização na nuvem

Para habilitar o modo online, configure a variável `VITE_DATABASE_URL` no arquivo `.env`

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
