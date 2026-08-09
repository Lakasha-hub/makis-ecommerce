# Makis Bijouterie — Backend API

REST API del e-commerce **Makis Bijouterie**, construida con **Node.js**, **Express**, **TypeScript** y **MongoDB**, completamente dockerizada para desarrollo y producción.

---

## Tabla de contenidos

- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Estructura de directorios](#estructura-de-directorios)
- [Configuración del proyecto](#configuración-del-proyecto)
- [Puesta en marcha](#puesta-en-marcha)
- [Endpoints disponibles](#endpoints-disponibles)
- [Modelos de datos](#modelos-de-datos)
- [Prácticas de seguridad](#prácticas-de-seguridad)
- [Manejo de errores](#manejo-de-errores)
- [Dependencias](#dependencias)

---

## Tecnologías utilizadas

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20 (Alpine) | Runtime |
| TypeScript | ^5.4 | Tipado estático |
| Express | ^4.19 | Framework HTTP |
| MongoDB | 6.0 | Base de datos |
| Mongoose | ^8.4 | ODM |
| Docker / Docker Compose | — | Containerización |
| Zod | ^4.4 | Validación de esquemas |
| JSON Web Token | ^9.0 | Autenticación |
| bcryptjs | ^3.0 | Hash de contraseñas |
| Nodemailer | ^9.0 | Envío de emails |
| Helmet | ^7.1 | Seguridad HTTP |
| CORS | ^2.8 | Control de origen cruzado |
| Morgan | ^1.10 | Logging de peticiones HTTP |

---

## Arquitectura del proyecto

El proyecto sigue una arquitectura en **capas** (Layered Architecture), separando las responsabilidades de cada módulo:

```
HTTP Request
     │
     ▼
 Routes          → Define los endpoints y aplica middlewares
     │
     ▼
 Middlewares     → Autenticación JWT, validación de esquemas (Zod), CORS, Helmet
     │
     ▼
 Controllers     → Orquestan la petición, llaman al Service y devuelven la respuesta HTTP
     │
     ▼
 Services        → Lógica de negocio pura (reglas, cálculos, side effects como emails)
     │
     ▼
 Repositories    → Abstracción de acceso a datos (queries a MongoDB vía Mongoose)
     │
     ▼
 Models          → Definición de esquemas y tipos Mongoose
```

### Patrones aplicados

- **Repository Pattern**: los repositorios abstraen las operaciones de base de datos, desacoplando la lógica de negocio del ORM.
- **Service Layer**: toda la lógica de negocio reside en los servicios, manteniendo los controladores delgados.
- **Middleware Chain**: cada ruta aplica solo los middlewares necesarios (auth, roles, validación).
- **Centralized Error Handling**: un único middleware captura y normaliza todos los errores de la aplicación.
- **Schema Validation (Zod)**: los payloads se validan antes de llegar al controlador.
- **Dockerized Multi-stage Build**: imagen de producción liviana separada del build de desarrollo.

---

## Estructura de directorios

```
backend/
├── src/
│   ├── app.ts                  # Setup de Express (middlewares y rutas)
│   ├── server.ts               # Entry point (conexión a DB y listen)
│   ├── config/
│   │   └── database.ts         # Conexión a MongoDB
│   ├── controllers/            # Handlers HTTP (reciben req, devuelven res)
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── product.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # authenticateJWT + authorizeRoles
│   │   ├── errorHandler.ts     # Manejo centralizado de errores
│   │   └── validateRequest.ts  # Validación de body con Zod
│   ├── models/                 # Esquemas y tipos Mongoose
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   ├── repositories/           # Abstracción de acceso a datos
│   ├── routes/                 # Definición de rutas Express
│   │   ├── auth.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── health.routes.ts
│   │   ├── order.routes.ts
│   │   ├── product.routes.ts
│   │   └── user.routes.ts
│   ├── schemas/                # Esquemas Zod para validación de entrada
│   ├── services/               # Lógica de negocio
│   │   ├── AuthService.ts
│   │   ├── CartService.ts
│   │   ├── EmailService.ts
│   │   ├── OrderService.ts
│   │   ├── ProductService.ts
│   │   └── UserService.ts
│   ├── templates/              # Plantillas HTML para emails
│   └── utils/
│       └── AppError.ts         # Clase de error personalizada
├── .dockerignore
├── .env.example                # Variables de entorno requeridas (sin valores reales)
├── .gitignore
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # Orquestación local (API + MongoDB)
├── package.json
└── tsconfig.json
```

---

## Configuración del proyecto

### Variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://root:password@localhost:27017/makis?authSource=admin` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `una_clave_larga_y_aleatoria` |
| `JWT_EXPIRES_IN` | Expiración del token JWT | `7d` |
| `FRONTEND_URL` | URL del frontend (para CORS) | `http://localhost:3001` |
| `SMTP_HOST` | Host del servidor SMTP | `smtp.ethereal.email` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | — |
| `SMTP_PASS` | Contraseña SMTP | — |
| `EMAIL_FROM` | Dirección remitente de emails | `noreply@makis.com` |

---

## Puesta en marcha

### Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose instalados.

### Desarrollo con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd backend

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Editá .env con tus valores

# 3. Levantar la API y MongoDB
docker-compose up --build
```

Esto inicia:
- **API Express** en `http://localhost:3000` con hot-reload (el código fuente se monta como volumen).
- **MongoDB 6.0** en `localhost:27017` con persistencia de datos mediante un volumen Docker.

### Desarrollo sin Docker

```bash
npm install
# Asegurate de tener MongoDB corriendo localmente y el .env configurado
npm run dev
```

### Compilar para producción

```bash
npm run build   # Compila TypeScript a dist/
npm start       # Ejecuta desde dist/
```

---

## Endpoints disponibles

### Base URL: `http://localhost:3000`

---

### Health

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servidor |

**Respuesta:**
```json
{
  "uptime": 123.45,
  "message": "OK",
  "timestamp": 1234567890,
  "environment": "development"
}
```

---

### Auth — `/api/auth`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | No | Iniciar sesión |

**POST `/api/auth/register`**
```json
// Body
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "miPassword123"
}
// Respuesta 201
{
  "user": { "name": "...", "email": "...", "role": "client" },
  "token": "<jwt>"
}
```

**POST `/api/auth/login`**
```json
// Body
{
  "email": "juan@example.com",
  "password": "miPassword123"
}
// Respuesta 200
{
  "user": { ... },
  "token": "<jwt>"
}
```

> Al registrarse, el sistema envía un email de bienvenida de forma asíncrona (fire & forget).

---

### Usuarios — `/api/users`

> Todos los endpoints requieren `Authorization: Bearer <token>`

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| `GET` | `/api/users/me` | `client` / `admin` | Ver perfil propio |
| `PUT` | `/api/users/me` | `client` / `admin` | Actualizar perfil propio |
| `DELETE` | `/api/users/:id` | `admin` | Eliminar usuario |

---

### Productos — `/api/products`

| Método | Endpoint | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/products` | No | — | Listar todos los productos |
| `GET` | `/api/products/:id` | No | — | Obtener producto por ID |
| `POST` | `/api/products` | Sí | `admin` | Crear producto |
| `PUT` | `/api/products/:id` | Sí | `admin` | Actualizar producto |
| `PATCH` | `/api/products/:id/variants/:variantId/stock` | Sí | `admin` | Actualizar stock de una variante |
| `DELETE` | `/api/products/:id` | Sí | `admin` | Eliminar producto |

**Categorías disponibles:** `anillo`, `arito`, `collar`, `pulsera`, `accesorio`

**Materiales disponibles:** `fantasia`, `acero_quirurgico`, `acero_dorado`, `acero_rosado`, `acero_blanco`, `plata`, `oro`, `bronce_plateado`, `bronce`

---

### Carrito — `/api/cart`

> Todos los endpoints requieren `Authorization: Bearer <token>`

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| `POST` | `/api/cart` | `client` / `admin` | Agregar o actualizar ítem en carrito |
| `GET` | `/api/cart/:id` | `client` / `admin` | Obtener carrito por ID |
| `GET` | `/api/cart/user/:userId` | `client` / `admin` | Obtener carrito por ID de usuario |
| `PUT` | `/api/cart/:id/items/:variantId` | `client` / `admin` | Actualizar cantidad de un ítem |
| `DELETE` | `/api/cart/:id/items/:variantId` | `client` / `admin` | Eliminar ítem del carrito |
| `DELETE` | `/api/cart/:id` | `client` / `admin` | Vaciar carrito completo |

> El `userId` se extrae automáticamente del token JWT. No es necesario (ni aceptado) enviarlo en el body.

---

### Órdenes — `/api/orders`

> Todos los endpoints requieren `Authorization: Bearer <token>`

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| `POST` | `/api/orders` | `client` / `admin` | Crear orden desde el carrito |
| `GET` | `/api/orders/my-orders` | `client` / `admin` | Ver mis órdenes |
| `GET` | `/api/orders/:id` | `client` / `admin` | Ver detalle de una orden |
| `PATCH` | `/api/orders/:id/status` | `admin` | Actualizar estado de una orden |
| `POST` | `/api/orders/:id/cancel` | `client` / `admin` | Cancelar una orden |

**Estados de orden:** `pending` → `paid` → `shipped` → `delivered` / `cancelled`

---

## Modelos de datos

### User
```ts
{
  name: string
  email: string        // unique
  password: string     // hashed con bcrypt
  role: 'client' | 'admin'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Product
```ts
{
  sku?: string
  title: string
  description: string
  price: number
  category: ProductCategory
  material: ProductMaterial
  images: string[]     // mínimo 1
  isActive: boolean
  variants: Variant[]  // mínimo 1
  totalStock: number   // virtual (suma de stocks de variantes)
  createdAt: Date
  updatedAt: Date
}

// Variant
{
  sku?: string
  specificationLabel: string   // ej. "Talle", "Color"
  specificationValue: string   // ej. "M", "Dorado"
  stock: number
  price?: number               // precio por variante (opcional)
}
```

### Cart
```ts
{
  userId?: ObjectId
  items: CartItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}
```

### Order
```ts
{
  userId: ObjectId
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}
```

---

## Prácticas de seguridad

| Práctica | Implementación |
|---|---|
| **Autenticación JWT** | Tokens firmados con `jsonwebtoken`, enviados en `Authorization: Bearer` |
| **Hash de contraseñas** | `bcryptjs` con salt factor 10 |
| **Control de roles** | Middleware `authorizeRoles('admin')` en rutas sensibles |
| **Validación de entrada** | Esquemas Zod validan el body antes de llegar al controlador |
| **Headers de seguridad** | `helmet` configura headers HTTP seguros (CSP, X-Frame-Options, etc.) |
| **CORS** | `cors` middleware, configurable vía `FRONTEND_URL` |
| **Variables de entorno** | Secrets gestionados con `.env` (nunca committeado) |
| **Secretos no expuestos** | `.env.example` usa placeholders, sin valores reales |
| **Errores normalizados** | El error handler nunca expone stack traces en producción |
| **MongoDB protegido** | Requiere autenticación (`authSource=admin`) |
| **Imagen Docker liviana** | Multi-stage build: imagen final solo contiene dependencias de producción |

---

## Manejo de errores

Todos los errores pasan por un middleware centralizado (`errorHandler`) que normaliza la respuesta:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": {
    "statusCode": 400,
    "message": "Detalle interno",
    "details": [ "..." ]
  }
}
```

**Tipos de error manejados automáticamente:**

| Tipo | Status |
|---|---|
| `AppError` (error de negocio) | Definido por el desarrollador |
| `ZodError` (validación) | `400` con detalle por campo |
| `mongoose.ValidationError` | `400` |
| Clave duplicada MongoDB (código `11000`) | `400` |
| `CastError` (ObjectId inválido) | `400` |
| Error genérico no manejado | `500` |

---

## Dependencias

### Producción

| Paquete | Versión | Uso |
|---|---|---|
| `express` | ^4.19.2 | Framework HTTP |
| `mongoose` | ^8.4.0 | ODM para MongoDB |
| `jsonwebtoken` | ^9.0.3 | Tokens JWT |
| `bcryptjs` | ^3.0.3 | Hash de contraseñas |
| `zod` | ^4.4.3 | Validación de esquemas |
| `helmet` | ^7.1.0 | Headers de seguridad |
| `cors` | ^2.8.5 | Control de CORS |
| `morgan` | ^1.10.0 | Logging HTTP |
| `dotenv` | ^16.4.5 | Variables de entorno |
| `nodemailer` | ^9.0.3 | Envío de emails transaccionales |

### Desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| `typescript` | ^5.4.5 | Compilador TypeScript |
| `tsx` | ^4.7.1 | Ejecución de TS con hot-reload |
| `@types/*` | Varios | Tipos para las dependencias de producción |

