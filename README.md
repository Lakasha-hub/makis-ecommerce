# Makis Bijouterie — Monorepo

Proyecto full-stack del e-commerce **Makis Bijouterie**, organizado como monorepo con backend y frontend independientes, orquestados con Docker Compose.

---

## Estructura del monorepo

```
makis/
├── backend/          # API REST — Node.js + Express + TypeScript + MongoDB
├── frontend/         # Cliente web — React + Vite + TypeScript
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js 20, Express, TypeScript, Mongoose |
| Frontend | React 18, Vite, TypeScript |
| Base de datos | MongoDB 6.0 |
| Containerización | Docker, Docker Compose |

---

## Puesta en marcha

### Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose instalados.

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd makis
```

### 2. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
# Editá backend/.env con tus valores
```

### 3. Levantar todos los servicios

```bash
docker-compose up --build
```

| Servicio | URL local |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| MongoDB | localhost:27017 |

> El código fuente de backend y frontend se monta como volumen — ambos recargan automáticamente al guardar cambios.

---

## Desarrollo sin Docker

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Documentación detallada

- [Backend — API, endpoints y arquitectura](./backend/README.md)
