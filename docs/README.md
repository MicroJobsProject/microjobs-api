# MicroJobs API

<!-- `>` **Selecciona tu Idioma:** [Inglés](README.md) 🔄 [Alemán](README.de.md) -->

## Objetivo del Proyecto

MicroJobs API es el backend RESTful que potencia la plataforma MicroJobs. Proporciona todos los endpoints necesarios para la gestión de usuarios, autenticación, anuncios de servicios y categorías. Desarrollado con Node.js, Express y MongoDB.

Este proyecto representa el **backend del trabajo final del Bootcamp Web Full Stack de KeepCoding**, implementando una API REST completa con autenticación, gestión de datos y servicios de email.

**Funcionalidades principales:**

- Sistema completo de autenticación con JWT
- Recuperación de contraseña mediante email con Nodemailer
- CRUD completo de anuncios de servicios
- Gestión de categorías dinámicas
- Gestión de perfil de usuario
- Filtrado y paginación avanzada
- Protección de rutas con middleware de autenticación
- Configuración multi-entorno (desarrollo/producción)

## Dependencias Utilizadas

bcrypt, cors, dotenv, express, jsonwebtoken, mongoose, nodemailer, cross-env, nodemon.

## Estructura de la Base de Datos

### Modelos

**User:**

```javascript
{
  username: String (required, unique, trim),
  email: String (required, unique, lowercase),
  password: String (required, min: 6, hashed),
  passwordResetToken: String (optional),
  passwordResetExpires: Date (optional)
}
```

**Advert:**

```javascript
{
  name: String (max: 80, required),
  owner: ObjectId (ref: User, required),
  price: Number (min: 0, max: 99999),
  offer: Boolean (true = ofrece, false = necesita),
  description: String (max: 640),
  category: String (required),
  photo: String (optional),
  timestamps: true (createdAt, updatedAt)
}
```

**Category:**

```javascript
{
  name: String (required, unique),
  icon: String (Material Icon name)
}
```

## Endpoints de la API

### Autenticación

```sh
POST   /api/auth/register         - Registro de usuario
POST   /api/auth/login            - Inicio de sesión
POST   /api/auth/logout           - Cerrar sesión
POST   /api/auth/forgot-password  - Solicitar reset de contraseña
POST   /api/auth/reset-password   - Resetear contraseña con token
```

### Perfil de Usuario (Protegidas)

```sh
GET    /api/user/profile          - Obtener perfil
PUT    /api/user/profile          - Actualizar perfil
PUT    /api/user/password         - Cambiar contraseña
DELETE /api/user/account          - Eliminar cuenta
GET    /api/user/stats            - Estadísticas del usuario
```

### Anuncios

```sh
GET    /api/adverts               - Listar anuncios (con filtros)
POST   /api/adverts               - Crear anuncio (auth required)
PUT    /api/adverts/:id           - Actualizar anuncio (auth required)
DELETE /api/adverts/:id           - Eliminar anuncio (auth required)
GET    /api/adverts/categories    - Listar categorías
```

### Parámetros de Filtrado (GET /api/adverts)

```sh
?page=1                           - Página actual
?limit=10                         - Items por página
?name=pintura                     - Búsqueda por nombre
?offer=true                       - Tipo (true/false)
?min=10&max=50                   - Rango de precio
?category=painting,plumbing       - Categorías (múltiple)
?sort=price                       - Ordenamiento
```

## Instrucciones de Instalación

### 1. Requisitos de Software

- **[Node.js](https://nodejs.org/en/download/)** (**Node:** >=v24.8.0)
- **[Git](https://git-scm.com/downloads)** (2.48.1)
- **[Visual Studio Code](https://code.visualstudio.com/)** (1.104.2)
- **[MongoDB](https://www.mongodb.com/try/download/community)** (v8.0.14)
- **[MicroJobs (Frontend)](https://github.com/MicroJobsProject/microjobs.git)**

> **📝 Nota:** Esta API está diseñada para trabajar en conjunto con el frontend **MicroJobs**. Para una experiencia completa, es necesario tener ambos proyectos en funcionamiento.

### 2. Clonación del Repositorio

```bash
git clone https://github.com/MicroJobsProject/microjobs-api.git

cd microjobs-api
```

### 3. Instalación de Dependencias

```bash
npm install
```

### 4. Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura las variables según tu entorno:

```env
# App
APP_NAME=MicroJobs

# Database
MONGODB_URI=mongodb://localhost:27017/microjobs-dev

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Server
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Provider (mailtrap para desarrollo/producción)
MAILER_PROVIDER=mailtrap

# Mailtrap (desarrollo/producción)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass

# Gmail (producción real - opcional)
EMAIL_USER=your.app@gmail.com
EMAIL_PASS=your-app-password  # Contraseña de aplicación

# Token Configuration
PASSWORD_RESET_TOKEN_EXPIRATION_HOURS=1
```

> **⚠️ Importante:** Nunca subas el archivo `.env` a git. Solo sube `.env.example` como plantilla.

### 5. Inicialización de la Base de Datos

```bash
# Carga datos de prueba (borra los existentes)
npm run initDB
```

Esto creará:

- 2 usuarios de prueba: `admin@example.com` y `user@example.com` (password: `123456`)
- 12 categorías de servicios
- 16 anuncios de ejemplo

### 6. Comandos

```bash
# Inicia el servidor en modo desarrollo con hot-reload
npm run dev

# Inicia el servidor en modo producción
npm start

# Inicializa/resetea la base de datos con datos de prueba
npm run initDB
```

### 7. Acceso a la API

Una vez iniciado el servidor, la API estará disponible en:

```sh
http://localhost:3000
```

## Configuración de Email

### Desarrollo

**Mailtrap** es perfecto para este proyecto ya que:

- No envía emails reales (seguro para demos)
- Plan gratuito suficiente (100 emails/mes)
- No requiere verificación de dominio
- Interfaz visual para ver los emails "enviados"

Configuración:

1. Crea cuenta gratuita en [Mailtrap.io](https://mailtrap.io)
2. Obtén las credenciales SMTP del inbox
3. Configura en `.env`
4. Los emails aparecerán en tu inbox de Mailtrap

### Desarrollo - Consola

Si no configuras Mailtrap, los enlaces se muestran en consola:

```sh
========================================
SIMULATED EMAIL (Configure Mailtrap in .env)
========================================
To: user@example.com
RESET URL: http://localhost:5173/reset-password?token=xxx
========================================
```

### Producción Real - Gmail (Opcional)

Para un entorno de producción real:

1. Habilita verificación en 2 pasos en Gmail
2. Genera una [contraseña de aplicación](https://myaccount.google.com/apppasswords)
3. Configura `EMAIL_USER` y `EMAIL_PASS` en `.env`
4. Cambia `MAILER_PROVIDER=smtp`

> **📝 Nota:** Para este proyecto, Mailtrap es la opción recomendada tanto para desarrollo como para la presentación final.

## Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- JWT tokens con expiración configurable
- Tokens de reset hasheados con SHA-256
- Validación de datos con mongoose
- CORS configurado para el frontend
- Variables sensibles en `.env` (nunca en el código)
- Protección de rutas con middleware de autenticación

## Recursos del Proyecto

- **Frontend (React):** 🔗 [MicroJobs](https://github.com/MicroJobsProject/microjobs)

- **Documentación de Mongoose:** 📚 [mongoosejs.com](https://mongoosejs.com)
- **Documentación de Express:** 📚 [expressjs.com](https://expressjs.com)
- **Mailtrap (Email Testing):** 📧 [mailtrap.io](https://mailtrap.io)

## Contribuciones y Licencia

Proyecto bajo licencia MIT. Desarrollado como proyecto final del Bootcamp Web Full Stack de KeepCoding. No se aceptan contribuciones externas, pero las sugerencias son bienvenidas.
