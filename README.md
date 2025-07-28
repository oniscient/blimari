# 🎓 Blimari - AI-Powered Learning Platform

> Transforme qualquer objetivo de aprendizado em uma trilha estruturada e personalizada em minutos

## 🚀 Visão Geral

Blimari é uma plataforma de aprendizado nativa de IA que combina curadoria inteligente de conteúdo com inteligência cultural para criar experiências educacionais personalizadas. Diferente das plataformas tradicionais que dependem de cursos pré-criados, o Blimari usa IA avançada para descobrir, curar e sequenciar automaticamente o melhor conteúdo educacional da internet.

## 🏗️ Arquitetura

\`\`\`
blimari/
├── 📂 src/
│   ├── 📂 app/                 # Next.js App Router
│   │   ├── 📄 page.tsx         # Landing page
│   │   ├── 📂 create/          # Path creation flow
│   │   ├── 📂 dashboard/       # User dashboard
│   │   ├── 📂 path/[id]/       # Learning paths
│   │   └── 📂 api/             # API routes
│   ├── 📂 components/          # React components
│   ├── 📂 lib/                 # Core utilities
│   ├── 📂 services/            # Business logic
│   └── 📂 types/               # TypeScript definitions
├── 📂 scripts/                 # Database scripts (para operações manuais ou futuras migrações)
└── 📂 docs/                    # Documentation
\`\`\`

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Neon PostgreSQL (acesso direto via `@neondatabase/serverless`)
- **AI**: Google Gemini, Qloo Cultural Intelligence
- **Content**: YouTube API, GitHub API, Medium RSS

## 🚀 Início Rápido

1.  **Clone o repositório**
  \`\`\`bash
  git clone https://github.com/your-username/blimari.git
  cd blimari
  \`\`\`

2.  **Instale as dependências**
  \`\`\`bash
  npm install
  \`\`\`

3.  **Configure as variáveis de ambiente**
  \`\`\`bash
  cp .env.example .env.local
  # Edite .env.local com suas chaves de API
  \`\`\`

4.  **Inicie o servidor de desenvolvimento**
  \`\`\`bash
  npm run dev
  \`\`\`

## 📊 Funcionalidades Principais

-   ✨ **Criação de Trilhas com IA**: Input simples → trilha completa
-   🧠 **Inteligência Cultural**: Personalização com Qloo Taste AI™
-   🔍 **Descoberta de Conteúdo**: Múltiplas fontes automaticamente
-   📈 **Tracking de Progresso**: Gamificação e badges
-   🎯 **Quizzes Adaptativos**: Validação de conhecimento
-   📱 **Design Responsivo**: Mobile-first, minimalista

## 🎨 Design System

O projeto segue um design system baseado nos princípios de Dieter Rams:
-   **Minimalismo**: "Good design is as little design as possible"
-   **Funcionalidade**: Cada elemento tem propósito claro
-   **Consistência**: Cores, tipografia e espaçamentos padronizados

## 🔧 Scripts Disponíveis

\`\`\`bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
npm run test         # Testes
\`\`\`

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
