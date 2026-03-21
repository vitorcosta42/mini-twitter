# 🐦 Mini Twitter

Projeto full-stack inspirado no Twitter (X), desenvolvido com foco em práticas modernas de desenvolvimento web, incluindo frontend reativo, API REST e testes.

---

## 📁 Estrutura do Projeto

```bash
mini-twitter/
├── mini-twitter-frontend/   # Aplicação Frontend (React + Vite)
├── mini-twitter-backend-main/  # API Backend  **Bun** e **ElysiaJS**,
└── README.md                # Documentação geral (este arquivo)
````

---

## 🚀 Sobre o Projeto

O **Mini Twitter** é uma aplicação onde usuários podem:

* Criar posts
* Curtir publicações
* Buscar posts
* Navegar com paginação infinita
* Autenticar-se na plataforma

---

## 🧠 Tecnologias Utilizadas

### Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* TanStack Query
* React Hook Form
* Zunstand
* Cypress (E2E)
* Jest (unitário)

### Backend

*  Bun e ElysiaJS,
* SQLITE
* Docker

---

## 🔗 Acesso aos Subprojetos

Cada parte do sistema possui sua própria documentação detalhada:

* 👉 `mini-twitter-frontend/README.md`
* 👉 `mini-twitter-backend-main/README.md`

---

## ⚙️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/vitorcosta42/mini-twitter.git
cd mini-twitter
```

---

### 2. Backend

```bash
cd mini-twitter-backend-main
# siga as instruções do README interno
```

---

### 3. Frontend

```bash
cd mini-twitter-frontend
# siga as instruções do README interno
```

---

## 🌐 Integração

O frontend consome a API do backend via variável de ambiente:

```env
VITE_API_URL=http://localhost:3000
```

---

## 📌 Objetivo

Este projeto foi desenvolvido com foco em:

* Integração entre frontend e backend
* Testes automatizados
* Boas práticas de código

---

## 👨‍💻 Autor

Desenvolvido por **Vitor Costa**

---

## 📄 Licença

Este projeto é para fins de teste prático.
