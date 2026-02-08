# 📘 Intranet Navarro Medical — Documentação Completa

> **Versão:** 1.0  
> **Tecnologia:** React 18 + Vite + TypeScript + Tailwind CSS  
> **Build:** Estático (`/dist`) — funciona em qualquer servidor web (Apache, Nginx, HumHub embed, etc.)  
> **Dados:** Todos os dados atuais são **MOCK (fake)** — prontos para substituição por APIs/backend.

---

## 📑 Índice

1. [Arquitetura do Projeto](#1--arquitetura-do-projeto)
2. [Estrutura de Arquivos](#2--estrutura-de-arquivos)
3. [Menu Superior (Header)](#3--menu-superior-header)
4. [Botão Login](#4--botão-login)
5. [Clima / Hora](#5--clima--hora)
6. [Carrossel de Notícias (Avisos & Campanhas)](#6--carrossel-de-notícias-avisos--campanhas)
7. [Fique por Dentro (NewsFeed)](#7--fique-por-dentro-newsfeed)
8. [Aniversariantes](#8--aniversariantes)
9. [Popup de Aviso](#9--popup-de-aviso)
10. [Popup de Aniversário](#10--popup-de-aniversário)
11. [Galeria](#11--galeria)
12. [Links Rápidos](#12--links-rápidos)
13. [Fundo Animado (Flow Field)](#13--fundo-animado-flow-field)
14. [Rodapé](#14--rodapé)
15. [Build e Exportação Final](#15--build-e-exportação-final)
16. [Dados Mock — Confirmação](#16--dados-mock--confirmação)
17. [Integração Futura com Backend](#17--integração-futura-com-backend)
18. [Logo / Imagem Personalizada](#18--logo--imagem-personalizada)

---

## 1 — Arquitetura do Projeto

### Tecnologias utilizadas

| Tecnologia | Função |
|---|---|
| **React 18** | Biblioteca de interface (componentes reutilizáveis) |
| **Vite** | Bundler e servidor de desenvolvimento |
| **TypeScript** | Tipagem estática (JavaScript com tipos) |
| **Tailwind CSS** | Estilização utilitária (classes CSS) |
| **shadcn/ui** | Componentes visuais pré-construídos |

### Como funciona

- O projeto é dividido em **componentes** (arquivos `.tsx`) — cada um controla uma parte da página.
- Os dados exibidos (notícias, aniversariantes, etc.) ficam dentro de **arrays JavaScript** no início de cada componente.
- **Não é necessário conhecimento em React** para editar textos, links e imagens — basta localizar o array correto e alterar os valores entre aspas.
- O resultado final é uma **página estática** (HTML + CSS + JS) que funciona em qualquer servidor web comum, sem necessidade de Node.js em produção.

### O que são os arquivos

| Tipo | Localização | O que faz |
|---|---|---|
| Componentes | `src/components/*.tsx` | Cada seção da página (Header, Carrossel, etc.) |
| Página principal | `src/pages/Index.tsx` | Monta a ordem dos componentes na tela |
| Estilos globais | `src/index.css` | Cores, fontes, animações, estilos do menu/checkbox |
| Configuração | `vite.config.ts`, `tailwind.config.ts` | Build e tema visual |
| Assets | `src/assets/` | Imagens locais (logo, etc.) |

---

## 2 — Estrutura de Arquivos

```
src/
├── assets/
│   └── navarro-logo.png          ← Logo salva (ver seção 18)
├── components/
│   ├── Header.tsx                ← Menu superior + Login + Clima
│   ├── WeatherCard.tsx           ← Temperatura / Hora / Data
│   ├── NewsCarousel.tsx          ← Carrossel "Avisos & Campanhas"
│   ├── NewsFeed.tsx              ← "Fique por dentro" (cards de notícias)
│   ├── BirthdaySidebar.tsx       ← Lista lateral de aniversariantes do mês
│   ├── BirthdayPopup.tsx         ← Popup de aniversariante do dia (confetes)
│   ├── AnnouncementPopup.tsx     ← Popup de aviso com checkbox
│   ├── GallerySection.tsx        ← Galeria com lightbox
│   ├── Gallery.tsx               ← Galeria alternativa (simples)
│   ├── QuickLinks.tsx            ← Grid de links rápidos
│   ├── FlowFieldBackground.tsx   ← Fundo animado em canvas
│   └── ui/                       ← Componentes shadcn (não editar)
├── pages/
│   └── Index.tsx                 ← Página principal (ordem dos componentes)
├── index.css                     ← Todos os estilos customizados
└── main.tsx                      ← Ponto de entrada (não editar)
```

---

## 3 — Menu Superior (Header)

**Arquivo:** `src/components/Header.tsx`

### Onde ficam os itens do menu

Linhas 3–29 — array `menuItems`:

```typescript
const menuItems = [
  {
    label: "Sistemas",              // ← Texto do botão
    links: [
      { text: "Prontuário Eletrônico", href: "http://localhost:8085/systems/prontuario" },
      { text: "Agendamento",           href: "http://localhost:8085/systems/agendamento" },
      { text: "Laboratório",           href: "http://localhost:8085/systems/lab" },
      { text: "Farmácia",              href: "http://localhost:8085/systems/farmacia" },
    ],
  },
  // ...outros menus
];
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Alterar texto do menu** | Mudar o valor de `label` (ex: `"Sistemas"` → `"Setores"`) |
| **Alterar texto do dropdown** | Mudar o valor de `text` dentro de `links` |
| **Alterar link** | Mudar o valor de `href` (ex: trocar `localhost:8085` pela URL real) |
| **Adicionar novo item ao dropdown** | Adicionar `{ text: "Novo Item", href: "https://url" }` dentro do array `links` |
| **Remover item do dropdown** | Deletar a linha `{ text: "...", href: "..." }` correspondente |
| **Adicionar novo menu** | Copiar o bloco completo `{ label: "...", links: [...] }` e colar após o último |
| **Remover menu inteiro** | Deletar o bloco `{ label: "...", links: [...] }` correspondente |

### Comportamento do dropdown

- O dropdown abre **por hover** (passar o mouse), sem necessidade de clique.
- Isso é controlado via CSS puro em `src/index.css`, classes `.nav-dropdown` e `.dropdown-content` (linhas 144–182).
- O efeito visual do botão (gradiente azul ao hover) é definido pela classe `.menu-btn` (linhas 86–114 do `index.css`).

---

## 4 — Botão Login

**Arquivo:** `src/components/Header.tsx`

### Onde está

Linhas 74–82:

```tsx
<a
  href="http://localhost:8085/user/auth/login"  // ← URL do login
  target="_blank"
  rel="noopener noreferrer"
  className="login-btn"
>
  Login
</a>
```

### Como alterar

| Ação | O que fazer |
|---|---|
| **Mudar URL do login** | Alterar o valor de `href` |
| **Login na mesma aba** | Remover `target="_blank"` |
| **Integrar SSO futuro** | Substituir o `<a>` por um `<button onClick={handleLogin}>` e implementar a função |

### Confirmação
- **Não há login hardcoded** — o botão apenas redireciona para uma URL configurável.
- O estilo visual está em `src/index.css`, classe `.login-btn` (linhas 117–142).

---

## 5 — Clima / Hora

**Arquivo:** `src/components/WeatherCard.tsx`

### Dados mock atuais

Linha 20–26:

```tsx
<span>☀️ 82°F</span>        // ← Temperatura FAKE
<span>{hours}</span>         // ← Hora real do navegador
<span>{date}</span>          // ← Data real do navegador
<span>Florida, USA</span>    // ← Localização FAKE
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Mudar temperatura** | Alterar `82°F` para qualquer valor |
| **Mudar ícone** | Alterar `☀️` para outro emoji (ex: `🌧️`, `⛅`) |
| **Mudar localização** | Alterar `Florida, USA` |
| **Mudar para Celsius** | Alterar `82°F` para `28°C` |

### Integração futura com API

Para usar dados reais, substituir os valores fixos por chamadas à API:

```typescript
// Exemplo com OpenWeatherMap:
const API_KEY = "SUA_CHAVE";
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=Florida&appid=${API_KEY}&units=imperial`
);
const data = await response.json();
// data.main.temp → temperatura
// data.weather[0].icon → ícone
```

---

## 6 — Carrossel de Notícias (Avisos & Campanhas)

**Arquivo:** `src/components/NewsCarousel.tsx`

### Onde ficam os dados mock

Linhas 25–54 — array `newsItems`:

```typescript
const newsItems = [
  {
    id: 1,                                    // ← Identificador único
    title: "🏥 Semana de Segurança ...",       // ← Título (aceita emoji)
    description: "De 10 a 14 de fevereiro...", // ← Texto curto
    image: "https://images.unsplash.com/...",  // ← URL da imagem
    gradient: "from-blue-600/30 to-cyan-500/10", // ← Cores do fundo
  },
  // ...
];
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Editar título** | Alterar o valor de `title` |
| **Editar descrição** | Alterar o valor de `description` |
| **Trocar imagem** | Alterar a URL em `image` (use Unsplash ou qualquer URL pública) |
| **Adicionar nova notícia** | Copiar um bloco `{ id, title, description, image, gradient }` e colar no array com `id` único |
| **Remover notícia** | Deletar o bloco correspondente do array |
| **Alterar cores de fundo** | Mudar o valor de `gradient` (ex: `"from-red-600/30 to-pink-500/10"`) |

### Velocidade do carrossel

Linha 68:

```typescript
const interval = setInterval(next, 6000); // ← 6000 = 6 segundos
```

| Ação | O que fazer |
|---|---|
| **Mais rápido** | Diminuir o número (ex: `3000` = 3 segundos) |
| **Mais lento** | Aumentar o número (ex: `10000` = 10 segundos) |

### Integração futura com backend

Substituir o array `newsItems` por dados vindos de uma API:

```typescript
// Substituir o array estático por:
const [newsItems, setNewsItems] = useState([]);

useEffect(() => {
  fetch("/api/v1/news")
    .then(res => res.json())
    .then(data => setNewsItems(data));
}, []);
```

Estrutura JSON esperada da API:
```json
[
  {
    "id": 1,
    "title": "Título da notícia",
    "description": "Texto curto",
    "image": "https://url-da-imagem.jpg",
    "gradient": "from-blue-600/30 to-cyan-500/10"
  }
]
```

---

## 7 — Fique por Dentro (NewsFeed)

**Arquivo:** `src/components/NewsFeed.tsx`

### Onde ficam os dados mock

Linhas 22–55 — array `articles`:

```typescript
const articles = [
  {
    id: 1,
    title: "Novo protocolo de higienização das mãos",
    excerpt: "Conheça as novas diretrizes...",
    image: "https://images.unsplash.com/...",
    date: "05 Feb 2026",
    category: "Saúde",
  },
  // ...
];
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Editar título** | Alterar o valor de `title` |
| **Editar resumo** | Alterar o valor de `excerpt` |
| **Trocar imagem** | Alterar a URL em `image` |
| **Mudar data** | Alterar o valor de `date` |
| **Mudar categoria** | Alterar o valor de `category` (ex: `"Saúde"` → `"TI"`) |
| **Adicionar artigo** | Copiar um bloco e colar no array com `id` único |
| **Remover artigo** | Deletar o bloco correspondente |

### Integração futura

```typescript
// Substituir array por:
const [articles, setArticles] = useState([]);
useEffect(() => {
  fetch("/api/v1/articles?limit=6")
    .then(res => res.json())
    .then(data => setArticles(data));
}, []);
```

---

## 8 — Aniversariantes

### 8.1 Lista Lateral (Sidebar)

**Arquivo:** `src/components/BirthdaySidebar.tsx`

#### Onde ficam os dados mock

Linhas 2–10 — array `birthdayList`:

```typescript
const birthdayList = [
  {
    name: "Ana Beatriz Silva",                   // ← Nome completo
    photo: "https://i.pravatar.cc/80?img=1",     // ← URL da foto (redonda)
    day: 3,                                       // ← Dia do mês
  },
  // ...
];
```

#### Como editar

| Ação | O que fazer |
|---|---|
| **Editar nome** | Alterar o valor de `name` |
| **Trocar foto** | Alterar a URL em `photo` (recomendado: imagem quadrada, mín. 80x80px) |
| **Mudar dia** | Alterar o valor numérico de `day` |
| **Adicionar pessoa** | Copiar um bloco `{ name, photo, day }` e inserir no array |
| **Remover pessoa** | Deletar o bloco correspondente |

O mês exibido no título é **automático** (mês atual do sistema).

### 8.2 Popup de Aniversário do Dia

**Arquivo:** `src/components/BirthdayPopup.tsx`

#### Onde ficam os dados mock

Linhas 4–8:

```typescript
const birthdayPerson = {
  name: "Dra. Mariana Oliveira",                // ← Nome do aniversariante
  photo: "https://i.pravatar.cc/200?img=5",     // ← Foto maior (200x200px)
  enabled: true,                                 // ← true = exibir | false = não exibir
};
```

#### Como controlar a exibição

| Ação | O que fazer |
|---|---|
| **Desativar popup** | Mudar `enabled` para `false` |
| **Ativar popup** | Mudar `enabled` para `true` |
| **Trocar aniversariante** | Alterar `name` e `photo` |

#### Controle de sessão

- O popup aparece **1 vez por sessão** do navegador.
- Ao fechar o navegador e reabrir, ou pressionar **Ctrl+F5** (hard refresh), o popup aparece novamente.
- Isso é controlado via `sessionStorage` com a chave `navarro_birthday_popup_shown` (linha 49).
- **Não usa `localStorage`** — portanto, o popup reaparece em cada nova sessão.

#### Integração futura

```typescript
// Substituir dados fixos por API:
const [birthdayPerson, setBirthdayPerson] = useState(null);
useEffect(() => {
  fetch("/api/v1/birthdays/today")
    .then(res => res.json())
    .then(data => {
      if (data) setBirthdayPerson({ ...data, enabled: true });
    });
}, []);
```

---

## 9 — Popup de Aviso

**Arquivo:** `src/components/AnnouncementPopup.tsx`

### Onde ficam os dados mock

Linhas 6–11:

```typescript
const mockAnnouncement = {
  id: "aviso-001",                           // ← Identificador
  title: "⚠️ Manutenção Programada",          // ← Título do aviso
  body: "O sistema de prontuário...",         // ← Texto completo do aviso
  enabled: true,                              // ← true = ativo | false = desativado
};
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Editar título** | Alterar o valor de `title` |
| **Editar texto** | Alterar o valor de `body` |
| **Desativar aviso** | Mudar `enabled` para `false` |
| **Ativar aviso** | Mudar `enabled` para `true` |

### Funcionamento

1. Se `enabled: true`, o popup aparece **automaticamente** ao carregar a página.
2. O usuário deve marcar o checkbox **"Li e estou ciente"** para poder clicar em "Fechar".
3. Após fechar, o aviso **não reaparece** na mesma sessão.
4. Ao pressionar **Ctrl+F5** (hard refresh) ou abrir nova sessão, o aviso reaparece.

### Controle de cache/sessão

- Chave de sessão: `navarro_announcement_dismissed` (linha 3).
- Armazenamento: `sessionStorage` (não `localStorage`).
- O popup só é gravado como "visto" ao clicar "Fechar" com o checkbox marcado.

### Estilo do checkbox

O checkbox estilizado está em `src/index.css`, classe `.checkbox-wrapper` (linhas 184–218).
Para mudar a cor do check: alterar `--checkbox-color` (padrão: `#00ff88`).

### Integração futura

```typescript
// Substituir mock por API:
const [announcement, setAnnouncement] = useState(null);
useEffect(() => {
  fetch("/api/v1/announcements/active")
    .then(res => res.json())
    .then(data => {
      if (data?.enabled) setAnnouncement(data);
    });
}, []);
```

---

## 10 — Popup de Aniversário

(Ver [seção 8.2](#82-popup-de-aniversário-do-dia) para detalhes completos.)

**Resumo do controle:**
- Exibe confetes animados (CSS em `src/index.css`, linhas 238–251).
- O botão "×" fecha o popup.
- Usa `sessionStorage` — reaparece em nova sessão ou Ctrl+F5.

---

## 11 — Galeria

**Arquivo:** `src/components/GallerySection.tsx`

### Onde ficam os dados mock

Linhas 27–66 — array `galleries`:

```typescript
const galleries = [
  {
    id: 1,
    title: "Confraternização Fim de Ano 2025",          // ← Nome do álbum
    cover: "https://images.unsplash.com/...?w=600...",   // ← Imagem de capa
    photos: [                                             // ← Fotos internas
      "https://images.unsplash.com/...?w=1200...",
      "https://images.unsplash.com/...?w=1200...",
    ],
  },
  // ...
];
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Trocar imagem de capa** | Alterar a URL em `cover` |
| **Trocar fotos internas** | Alterar as URLs dentro do array `photos` |
| **Adicionar novas fotos** | Adicionar URLs ao array `photos` |
| **Remover foto** | Deletar a URL correspondente do array |
| **Adicionar novo álbum** | Copiar um bloco `{ id, title, cover, photos }` com `id` único |
| **Remover álbum** | Deletar o bloco correspondente |
| **Renomear álbum** | Alterar o valor de `title` |

### Lightbox

- Ao clicar em um álbum, abre um **visualizador fullscreen** (lightbox).
- Setas de navegação esquerda/direita.
- Thumbnails na parte inferior.
- O lightbox é controlado internamente pelo componente (estados `openGallery` e `currentPhoto`).

### Integração futura (upload/admin)

```typescript
// Substituir array por API:
const [galleries, setGalleries] = useState([]);
useEffect(() => {
  fetch("/api/v1/galleries")
    .then(res => res.json())
    .then(data => setGalleries(data));
}, []);
```

Estrutura JSON esperada:
```json
[
  {
    "id": 1,
    "title": "Nome do álbum",
    "cover": "https://url-da-capa.jpg",
    "photos": ["https://foto1.jpg", "https://foto2.jpg"]
  }
]
```

> **Nota:** A seção Galeria não está ativa no layout atual (não incluída em `Index.tsx`). Para ativá-la, adicione `<GallerySection />` na página principal — veja [seção 14](#14--rodapé).

---

## 12 — Links Rápidos

**Arquivo:** `src/components/QuickLinks.tsx`

### Onde ficam os dados

Linhas 3–60 — array `quickLinks`:

```typescript
const quickLinks = [
  {
    icon: FileText,                                      // ← Ícone (componente Lucide)
    title: "Prontuário Eletrônico",                      // ← Texto exibido
    description: "Acesse prontuários e históricos",      // ← Descrição (não exibida atualmente)
    href: "http://localhost:8085/systems/prontuario",     // ← Link de destino
    color: "from-blue-500/20 to-blue-600/5",             // ← Gradiente do ícone
  },
  // ...
];
```

### Como editar

| Ação | O que fazer |
|---|---|
| **Mudar texto** | Alterar `title` |
| **Mudar link** | Alterar `href` |
| **Mudar ícone** | Alterar o nome do ícone importado (ex: `FileText` → `Heart`). Lista completa: [lucide.dev/icons](https://lucide.dev/icons/) |
| **Mudar cor** | Alterar `color` (ex: `"from-red-500/20 to-red-600/5"`) |
| **Adicionar link** | Copiar bloco e inserir no array. Importar o ícone no topo do arquivo |
| **Remover link** | Deletar o bloco correspondente |

---

## 13 — Fundo Animado (Flow Field)

**Arquivo:** `src/components/FlowFieldBackground.tsx`

### Configurações ajustáveis

Linha 28–31:

```typescript
const PARTICLE_COUNT = 120;    // ← Quantidade de partículas
const TRAIL_LENGTH = 20;       // ← Comprimento do rastro
const TRAIL_OPACITY = 0.3;     // ← Opacidade do rastro (0 a 1)
const MOUSE_RADIUS = 150;      // ← Raio de repulsão do mouse (pixels)
```

| Ação | O que fazer |
|---|---|
| **Mais partículas** | Aumentar `PARTICLE_COUNT` (cuidado: impacta performance) |
| **Menos partículas** | Diminuir `PARTICLE_COUNT` |
| **Rastro mais longo** | Aumentar `TRAIL_LENGTH` |
| **Animação mais rápida** | Alterar `time += 0.005` (linha 74) para valor maior (ex: `0.01`) |
| **Cores** | Alterar HSL em `ctx.strokeStyle` (linha 117) e `ctx.fillStyle` (linha 127) |

---

## 14 — Rodapé

**Arquivo:** `src/pages/Index.tsx`

Linha 46:

```tsx
<footer className="...">
  © 2026 INWISEPRO — Intranet Corporativa
</footer>
```

Para editar o texto, basta alterar o conteúdo entre as tags `<footer>`.

### Ordem dos componentes na página

A ordem de exibição é controlada em `src/pages/Index.tsx` (linhas 18–48):

```
1. FlowFieldBackground (fundo)
2. Header (menu superior fixo)
3. AnnouncementPopup (popup de aviso, se ativo)
4. BirthdayPopup (popup de aniversário, se ativo)
5. Título "Intranet Navarro Medical"
6. NewsFeed (esquerda) + BirthdaySidebar (direita)
7. NewsCarousel (Avisos & Campanhas)
8. QuickLinks (Links Rápidos)
9. Footer (Rodapé)
```

Para **adicionar a Galeria**, importe e insira o componente:

```tsx
import GallerySection from "@/components/GallerySection";

// Dentro do <main>, antes do QuickLinks:
<GallerySection />
```

---

## 15 — Build e Exportação Final

### Gerar o build

Execute no terminal (na raiz do projeto):

```bash
npm run build
```

### O que será gerado

Uma pasta chamada **`/dist`** contendo:

```
dist/
├── index.html          ← Página principal
├── assets/
│   ├── index-XXXXX.js  ← JavaScript compilado
│   ├── index-XXXXX.css ← CSS compilado
│   └── navarro-logo-XXXXX.png  ← Imagens (se houver)
├── favicon.ico
├── robots.txt
└── placeholder.svg
```

### O que enviar para produção

**SOMENTE a pasta `/dist`**. Todo o conteúdo desta pasta deve ser copiado para o servidor web.

### Confirmações

| Pergunta | Resposta |
|---|---|
| Precisa de Node.js em produção? | **NÃO** — o build gera arquivos estáticos |
| Funciona em Apache? | **SIM** |
| Funciona em Nginx? | **SIM** |
| Funciona integrado ao HumHub? | **SIM** — basta hospedar o `/dist` em uma rota acessível |
| Precisa de banco de dados? | **NÃO** — todos os dados são mock (fixos no código) |
| Precisa de dependência externa? | **NÃO** — tudo é empacotado no build |

### Configuração de servidor (SPA)

Como o projeto usa React Router, configure o servidor para redirecionar todas as rotas para `index.html`:

**Apache** (`.htaccess` na pasta `/dist`):
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 16 — Dados Mock — Confirmação

> ⚠️ **TODOS os dados exibidos atualmente na intranet são FICTÍCIOS (mock).**

| Dado | Arquivo | Pode ser removido/substituído? |
|---|---|---|
| Aniversariantes (lista) | `src/components/BirthdaySidebar.tsx` | ✅ SIM |
| Aniversariante do dia | `src/components/BirthdayPopup.tsx` | ✅ SIM |
| Notícias (carrossel) | `src/components/NewsCarousel.tsx` | ✅ SIM |
| Notícias (feed) | `src/components/NewsFeed.tsx` | ✅ SIM |
| Aviso popup | `src/components/AnnouncementPopup.tsx` | ✅ SIM |
| Galeria | `src/components/GallerySection.tsx` | ✅ SIM |
| Clima/hora | `src/components/WeatherCard.tsx` | ✅ SIM |
| Links rápidos | `src/components/QuickLinks.tsx` | ✅ SIM |
| Menus/dropdowns | `src/components/Header.tsx` | ✅ SIM |

Todos podem ser **substituídos por dados vindos de API/backend** sem alterar o layout visual.

---

## 17 — Integração Futura com Backend

### Padrão de substituição

Cada componente que usa dados mock segue este padrão para integração:

**Antes (mock):**
```typescript
const dados = [
  { id: 1, title: "Mock", ... },
];
```

**Depois (API):**
```typescript
import { useState, useEffect } from "react";

const [dados, setDados] = useState([]);

useEffect(() => {
  fetch("https://SEU-BACKEND/api/endpoint")
    .then(res => res.json())
    .then(data => setDados(data));
}, []);
```

### Endpoints sugeridos por funcionalidade

| Funcionalidade | Endpoint sugerido | Método |
|---|---|---|
| Notícias (carrossel) | `GET /api/v1/news` | GET |
| Notícias (feed) | `GET /api/v1/articles?limit=6` | GET |
| Aniversariantes (lista) | `GET /api/v1/birthdays/month` | GET |
| Aniversariante do dia | `GET /api/v1/birthdays/today` | GET |
| Aviso ativo | `GET /api/v1/announcements/active` | GET |
| Galerias | `GET /api/v1/galleries` | GET |
| Clima | API pública (OpenWeatherMap, etc.) | GET |

### Administração pós-login

Após implementar autenticação (SSO, HumHub, etc.), as seguintes funcionalidades podem ser controladas via painel administrativo:

- Criar/editar/remover notícias
- Ativar/desativar avisos
- Upload de fotos para galeria
- Gerenciar lista de aniversariantes
- Configurar links rápidos

---

## 18 — Logo / Imagem Personalizada

### Imagem já salva no projeto

O arquivo `src/assets/navarro-logo.png` já existe no projeto. Atualmente o header usa texto ("N" + "Navarro Medical") em vez da imagem.

### Como ativar a logo no header

1. Abra `src/components/Header.tsx`
2. Adicione o import no topo:
   ```typescript
   import navarroLogo from "@/assets/navarro-logo.png";
   ```
3. Substitua o bloco do logo (linhas 36–43) por:
   ```tsx
   <div className="flex items-center gap-2">
     <img src={navarroLogo} alt="Navarro Medical Centers" className="h-10 w-auto" />
   </div>
   ```

### Como trocar a logo

1. Salve a nova imagem em `src/assets/` com o nome `navarro-logo.png` (substituindo a existente).
2. O sistema usará automaticamente a nova imagem no próximo build.
3. Formatos suportados: `.png`, `.jpg`, `.svg`, `.webp`.

### Como fazer upload via ChatGPT ou outra IA

Se estiver usando ChatGPT ou outra IA para editar o código:

1. Faça upload da imagem no chat.
2. Peça: *"Salve esta imagem em `src/assets/navarro-logo.png`"*.
3. A IA copiará o arquivo para a pasta correta.
4. No Lovable, use o comando: *"Salve esta imagem que enviei em src/assets/navarro-logo.png e use no Header"*.

---

## 🔚 Texto do Rodapé

Arquivo: `src/pages/Index.tsx`, linha 46.

Texto atual:
```
© 2026 INWISEPRO — Intranet Corporativa
```

Para alterar, edite diretamente o texto entre as tags `<footer>`.

---

> **Documentação gerada para:** Intranet Navarro Medical v1.0  
> **Data:** Fevereiro 2026  
> **Equipe técnica:** INWISEPRO
