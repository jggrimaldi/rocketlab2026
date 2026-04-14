# 🛍️ Sistema de Gerenciamento de E-Commerce

Projeto desenvolvido com foco em gerenciamento de produtos, análise de vendas e avaliações, utilizando uma arquitetura moderna com **FastAPI (backend)**, **React + TypeScript (frontend)** e **SQLite (banco de dados)**.

---

## 🚀 Tecnologias utilizadas

### Backend

* FastAPI
* SQLAlchemy
* Alembic
* SQLite

### Frontend

* React
* TypeScript
* Vite
* TailwindCSS

---

## ⚙️ Como rodar o projeto

### 🔹 Pré-requisitos

* Python **3.11+**
* Node.js **20.19+ ou 22.12+**
* npm

---

### 🔹 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd rocketlab2026
```

---

### 🔹 2. Configurar o backend

```bash
cd backend

# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar banco de dados
alembic upgrade head

# Popular banco com dados (CSV)
python app/seeds/seed.py

# Rodar backend
uvicorn app.main:app --reload
```

📍 Backend disponível em:

* http://127.0.0.1:8000
* Docs: http://127.0.0.1:8000/docs

---

### 🔹 3. Configurar o frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar aplicação
npm run dev
```

📍 Frontend disponível em:

* http://localhost:5173

---

## 📦 Funcionalidades

* 📦 Gerenciamento completo de produtos (CRUD)
* 🔍 Busca de produtos
* 🛍️ Visualização em catálogo (grid)
* ⭐ Sistema de avaliações
* 📊 Visualização de vendas
* 📄 Página de detalhes do produto

---

## ✨ Diferenciais do projeto

### 📊 Dashboard

* Visão geral do sistema com métricas principais
* Total de produtos, vendas e avaliações
* Implementação leve para evitar impacto de performance

---

### 📱 Responsividade (Mobile First)

* Interface totalmente adaptável
* Sem scroll horizontal
* Grid responsivo de produtos
* Experiência otimizada para dispositivos móveis

---

### ⚡ Performance otimizada

* Paginação no backend
* Renderização eficiente no frontend
* Separação entre listagem e detalhes
* Evita carregamento massivo de dados

---

### 🎨 Design moderno e customizável

* Interface elegante com foco em UX
* Sistema de temas:

  * 🖤 Preto + Dourado
  * 🤍 Branco + Roxo
* Alternância de tema dinâmica

---

### 🧠 Arquitetura bem organizada

* Separação clara entre backend e frontend
* Componentização no React
* Estrutura modular e escalável
* Código limpo e reutilizável

---

## 📁 Estrutura do projeto

```bash
backend/
  app/
    models/
    routes/
    schemas/
    seeds/
    __init__.py
    config.py
    database.py
    main.py

frontend/
  src/
    assets/
    components/
    pages/
    services/
    types/
    App.css
    App.tsx
    index.css
    main.tsx
```

---

## 🧪 Dados do projeto

Os dados são carregados a partir de arquivos `.csv` fornecidos:

* Produtos
* Pedidos
* Avaliações
* Consumidores
* Vendedores

A população do banco é feita via script de seed.

---

## 📌 Observações

* O projeto foi desenvolvido com foco em **performance e escalabilidade**
* A aplicação evita carregamento desnecessário de grandes volumes de dados
* Interface pensada para uso real por gestores

---

## 👨‍💻 Autor

Desenvolvido por **João Guilherme da Fonte Grimaldi**

---

## 📄 Licença

Este projeto é para fins educacionais.
