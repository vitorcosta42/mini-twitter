<!-- --- -->

# 📱 Mini Twitter - Frontend

Aplicação front-end de um **Mini Twitter**, desenvolvida com foco em boas práticas modernas de desenvolvimento, incluindo componentização, gerenciamento de estado, testes e consumo de API.

## 🚀 Tecnologias utilizadas

- ⚛️ React
- ⚡ Vite
- 🟦 TypeScript
- 🎨 Tailwind CSS
- 🔄 React Query (TanStack Query)
- 📦 Zustand (gerenciamento de estado)
- 🧪 Jest + Testing Library (testes unitários)
- 🌐 Cypress (testes E2E)
- 🔗 React Router DOM

---

## 📸 Funcionalidades

- ✅ Listagem de posts (timeline)
- 🔍 Busca de posts
- 🔁 Paginação infinita (infinite scroll)
- 👤 Autenticação (login e registro)
- ✍️ Criação de posts
- ✏️ Edição de posts
- ❌ Exclusão de posts
- ❤️ Curtir posts
- 🌙 Tema dark/light
- 📱 Layout responsivo

---

## 📂 Estrutura do projeto

```
src/
 ├── pages/
 ├── components/
 ├── services/
 └── stores/
```

---

## ⚙️ Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/mini-twitter-frontend.git
```

```bash
cd mini-twitter-frontend
```

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000
```

> ⚠️ Certifique-se de que o back-end está rodando.

---

### 4. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

---

## 🧪 Testes

### ▶️ Rodar testes unitários (Jest)

````bash
npm run test

Modo watch:

```bash
npm run test:watch
````

---

### 🌐 Rodar testes E2E (Cypress)

Abrir interface:

```bash
npm run cypress:open
```

Modo headless:

```bash
npm run cypress:run
```

---

## 🧠 Decisões técnicas

- **TanStack Query** foi utilizado para gerenciamento de cache e requisições assíncronas.
- **Zustand** para estado global simples (ex: autenticação).
- **Tailwind CSS** para estilização rápida e responsiva.
- **Jest + Testing Library** para testes focados no comportamento do usuário.
- **Cypress** para testes de ponta a ponta simulando uso real.

---

## 📌 Melhorias futuras

- 🔔 Notificações em tempo real
- 💬 Comentários em posts
- 🚀 Deploy (Vercel / Netlify)

---

## 👨‍💻 Autor

Desenvolvido por **Vitor Costa**

- 💼 Desenvolvedor Front-end / Full-stack
- 🚀 Focado em React, Vue e performance

---

## 📄 Licença

Este projeto está sob a licença MIT.

---
