# PostFlow

Plataforma de publicação multicanal. Crie, adapte e publique conteúdo no TikTok, Instagram, X, Telegram e Discord a partir de um único lugar.

## Funcionalidades

- **Firebase Auth** — login, cadastro e logout
- **Adaptação de conteúdo** — texto otimizado automaticamente para cada plataforma
- **Preview em tempo real** — visualize antes de publicar
- **Telegram** — publicação real via Bot API (requer token)
- **Discord** — publicação real via Webhook (requer URL)
- **TikTok / Instagram / X** — modo simulado (requer aprovação OAuth de cada plataforma)
- **Histórico** — postagens salvas no Firestore por usuário
- **Rascunhos** — salve e recupere conteúdos
- **Upload de mídia** — imagens e vídeos via Firebase Storage

---

## Rodando localmente

```bash
# 1. Clone o repositório
git clone https://github.com/Changzaoo/post.git
cd post

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e preencha os valores do Firebase e das plataformas

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Build de produção
npm run build
npm run preview
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Onde obter | Tipo |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Configurações do projeto | Público |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console | Público |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console | Público |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console | Público |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console | Público |
| `VITE_FIREBASE_APP_ID` | Firebase Console | Público |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Console (opcional) | Público |
| `TELEGRAM_BOT_TOKEN` | @BotFather no Telegram | Secreto |
| `TELEGRAM_CHAT_ID` | @getidsbot | Secreto |
| `DISCORD_WEBHOOK_URL` | Canal Discord → Integrações → Webhooks | Secreto |

Variáveis `VITE_` ficam expostas no bundle do browser — nunca coloque segredos nelas.
Variáveis sem `VITE_` ficam apenas no backend (funções serverless da Vercel).

---

## Deploy na Vercel

### 1. Importe o repositório

1. Acesse vercel.com e clique em **Add New → Project**
2. Conecte sua conta GitHub e selecione o repositório `post`
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2. Configure as variáveis de ambiente

No painel do projeto: **Settings → Environment Variables**

Adicione todas as variáveis listadas acima com seus valores reais.

### 3. Deploy

Clique em **Deploy**. Para redeploys automáticos, basta fazer `git push`.

---

## Firebase — Configuração inicial

1. Acesse o Firebase Console e crie um projeto
2. Ative **Authentication** → Email/Password
3. Ative **Firestore Database**
4. Ative **Storage**
5. Em **Configurações do projeto → Seus apps**, adicione um app Web e copie as credenciais para `.env`
6. Configure as regras dos arquivos `firestore.rules` e `storage.rules`

---

## Telegram — Como configurar

1. Crie um bot no @BotFather e copie o token
2. Adicione o bot ao seu canal ou grupo como administrador
3. Use @getidsbot para obter o Chat ID
4. Configure `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` nas variáveis de ambiente

---

## Discord — Como configurar

1. No servidor Discord: Editar Canal → Integrações → Webhooks
2. Crie um novo Webhook e copie a URL
3. Configure `DISCORD_WEBHOOK_URL` nas variáveis de ambiente

---

## TikTok / Instagram / X (modo simulado)

Estas plataformas requerem aprovação de apps OAuth. Enquanto isso, o app exibe status `Simulado` após publicar.

- **TikTok:** developers.tiktok.com
- **Instagram:** developers.facebook.com
- **X:** developer.twitter.com

---

## Estrutura do projeto

```
src/
  components/     UI components e previews
  contexts/       AuthContext (Firebase Auth)
  lib/            firebase.ts (unica inicializacao)
  modules/        ContentAdapter
  pages/          Dashboard, Composer, History, Settings, Login
  services/       Platform services
  server/         PublishOrchestrator
  types/          TypeScript types
api/
  publish/        Serverless functions (Vercel)
```
