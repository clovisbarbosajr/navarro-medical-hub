# 🏥 Navarro Medical — Intranet Corporativa

Intranet corporativa para o grupo Navarro Medical, construída com **React + Vite + TypeScript + Tailwind CSS** e backend **Lovable Cloud**.

---

## 📋 Funcionalidades

### Página Principal (Pública)
| Recurso | Descrição |
|---------|-----------|
| **Notícias** | Feed de notícias com categorias (dados mock — conectar ao banco) |
| **Aniversariantes** | Sidebar com próximos aniversariantes do banco |
| **Avisos & Campanhas** | Carrossel rotativo (dados mock — conectar ao banco) |
| **Galeria** | Grid de imagens com **lightbox** (teclado: ← → Esc), dados do banco |
| **Quick Links** | Links rápidos configuráveis |
| **Motor de Temas** | Aplica automaticamente cores temáticas quando um feriado/data profissional está ativo |
| **Popup de Avisos** | Exibe avisos ativos do banco em popup |
| **Popup de Aniversários** | Confete + destaque para aniversariantes do dia |
| **Fundo Animado** | Flow field com partículas ultra-lentas e suaves |

### Dashboard Administrativo (Autenticado)
| Seção | Descrição |
|-------|-----------|
| **📰 Notícias** | CRUD completo com upload de imagem (auto-resize 800×400) |
| **⚠️ Avisos** | CRUD + toggle ativo/inativo + data de expiração |
| **🎂 Aniversariantes** | CRUD com foto (auto-resize 200×200) |
| **📸 Campanhas & Galeria** | CRUD com imagem (auto-resize 800×400) |
| **🎨 Temas de Feriado** | 33 datas pré-cadastradas (federais + profissionais médicas) |
| **🔗 Links do Menu** | Gerenciamento dos links da navbar |
| **⚙️ Configurações** | Configurações gerais do site |
| **📅 Datas Chegando** | Widget de alertas + botão "Criar Aviso" auto-preenchido |

### Auto-Preencher Aviso
No widget "Datas Comemorativas Chegando", datas profissionais com mensagem sugerida têm o botão **"Criar Aviso com esta mensagem"** — preenche título e corpo automaticamente.

---

## 🔐 Credenciais de Acesso

| Usuário | Email | Senha | Papel |
|---------|-------|-------|-------|
| Admin | admin@navarro.med | `t8c7Ug1l@` | `admin` — acesso total |
| Manager | manager@navarro.med | `t8c7Ug1l@` | `manager` — conteúdo |

> ⚠️ **Altere as senhas em produção!**

---

## 🗄️ Estrutura do Banco de Dados

| Tabela | Campos principais | RLS |
|--------|-------------------|-----|
| `announcements` | title, body, enabled, end_date | Leitura pública, escrita editor |
| `birthdays` | name, birth_date, photo_url | Leitura pública, escrita editor |
| `news` | title, excerpt, image_url, category | Leitura pública, escrita editor |
| `gallery_images` | title, description, image_url, sort_order | Leitura pública, escrita editor |
| `holiday_themes` | name, emoji, css_overrides, holiday_date, activation_start/end, enabled, is_professional_date, suggested_message, image_bank_url | Leitura pública, escrita editor |
| `menu_links` | category, label, href, sort_order | Leitura pública, escrita admin |
| `site_settings` | key, value | Leitura pública, escrita admin |
| `user_roles` | user_id, role (admin/manager) | Admin gerencia, user lê próprio |

### Funções do Banco
- `is_admin()` — verifica se o user autenticado é admin
- `is_manager()` — verifica se é manager
- `is_content_editor()` — retorna true se admin ou manager
- `has_role(role, user_id)` — verifica role específico

---

## 🎨 Motor de Temas Sazonais

O sistema aplica temas automaticamente na home:
1. Busca `holiday_themes` onde `enabled = true` e `activation_start ≤ hoje ≤ activation_end`
2. Aplica `css_overrides` (variáveis como `--primary`, `--accent`) no `:root`
3. Exibe banner temático com emoji e nome

### Datas Profissionais Médicas
- **Mensagem sugerida** para criar avisos rápidos (botão no dashboard)
- **Link para Unsplash** com imagens temáticas
- Badge 🩺 diferenciada no dashboard

### Temas Pré-cadastrados (33 datas)
Incluem feriados federais + datas profissionais: Dia do Médico, Semana da Enfermagem, Dia do Fisioterapeuta, EMS Week, etc.

---

## 🛠️ Stack Técnica

| Tecnologia | Uso |
|------------|-----|
| React 18 | UI (SPA) |
| Vite | Build tool |
| TypeScript | Type safety |
| Tailwind CSS | Styling (glassmorphism + design tokens) |
| Lovable Cloud | Backend (auth, DB, storage) |
| TanStack Query | Data fetching |
| React Router | Routing |
| Lucide React | Ícones |
| Canvas API | Fundo animado (flow field) |

---

## 📁 Estrutura de Arquivos

```
src/
├── assets/              # Logo e imagens estáticas
├── components/
│   ├── admin/           # Componentes do dashboard
│   │   ├── AnnouncementsManager.tsx
│   │   ├── BirthdaysManager.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── GalleryManager.tsx
│   │   ├── HolidayThemesManager.tsx
│   │   ├── MenuLinksManager.tsx
│   │   ├── NewsManager.tsx
│   │   ├── SiteSettingsManager.tsx
│   │   └── UpcomingDatesAlert.tsx
│   ├── ui/              # shadcn/ui components
│   ├── AnnouncementPopup.tsx
│   ├── BirthdayPopup.tsx
│   ├── BirthdaySidebar.tsx
│   ├── FlowFieldBackground.tsx
│   ├── GallerySection.tsx
│   ├── Header.tsx
│   ├── NewsFeed.tsx
│   ├── NewsCarousel.tsx
│   ├── QuickLinks.tsx
│   └── WeatherCard.tsx
├── contexts/
│   └── AuthContext.tsx   # Auth com mapeamento user → role
├── hooks/
│   ├── useActiveTheme.ts # Hook do motor de temas
│   └── use-mobile.tsx
├── integrations/
│   └── supabase/         # Client + types (auto-gerados)
├── lib/
│   ├── imageResize.ts    # Resize + upload de imagens
│   └── utils.ts
├── pages/
│   ├── Dashboard.tsx     # Painel admin com prefill de avisos
│   ├── Index.tsx         # Home com tema ativo + galeria
│   ├── Login.tsx         # Login com botão "Voltar à Intranet"
│   └── NotFound.tsx
├── types/
│   └── database.ts       # Tipos TypeScript das tabelas
├── index.css             # Design tokens + glassmorphism
└── App.tsx               # Rotas
```

---

## 🚀 Como Rodar Localmente

```bash
npm install
npm run dev
```

Disponível em `http://localhost:5173`.

---

## 📦 Deploy

Hospedado via **Lovable**:
- **Produção**: https://navarro-connect-hub.lovable.app

Para publicar: clique em **"Publish"** na interface do Lovable.

---

## 🔄 Como Migrar / Transferir

1. **Código**: repositório Git conectado ao Lovable
2. **Dados**: exporte via Cloud View > Run SQL
3. **Storage**: download manual do bucket `gallery`
4. **Usuários**: recrie via edge function `seed-users`

### Limpar Dados de Teste
```sql
DELETE FROM announcements;
DELETE FROM news;
DELETE FROM birthdays;
DELETE FROM gallery_images;
```

---

## 📝 Notas

- **Imagens** redimensionadas automaticamente no upload (800×400 campanhas, 200×200 fotos)
- **Temas** devem ser **habilitados manualmente** (campo `enabled` no dashboard)
- **NewsFeed** e **NewsCarousel** ainda usam dados mock
- **Fundo de partículas**: 40 partículas, velocidade 0.0004 (ultra-lento)
- Todas as tabelas com **RLS ativo**
- **Galeria lightbox**: suporta navegação por teclado (← → Esc) e botão "Fechar" visível
- **Login**: botão "← Voltar à Intranet" no canto superior esquerdo
