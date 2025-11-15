# Flete MVP - Sistema de Gestión de Fletes

Sistema MVP para gestionar servicios de fletes, mudanzas y retiro de escombros. Diseñado para equipos pequeños (2 personas) con funcionalidades esenciales.

## 🚀 Estado del Deployment
- ✅ **Deploy Automático:** Configurado con Render
- ✅ **Base de Datos:** PostgreSQL en Neon (producción)
- ✅ **CI/CD:** Auto-deploy en push a `main`
- 🌐 **URL Producción:** https://flete-mvp.onrender.com (actualizando...)

## Características

### Funcionalidades Implementadas

- **Calendario Interactivo**: Vista mensual, semanal y diaria de servicios agendados
- **Gestión de Servicios**: CRUD completo para fletes, mudanzas y retiro de escombros
- **Gestión de Clientes**: Administración de clientes con historial de servicios
- **Formularios Dinámicos**: Formularios adaptables según el tipo de servicio
- **Integración con Google Maps**: Autocompletado de direcciones con Google Places API
- **Exportación CSV**: Descarga de servicios por mes
- **Filtros y Búsqueda**: Filtrado por tipo de servicio, estado, cliente, etc.
- **UI Moderna**: Interfaz minimalista estilo SaaS con Shadcn UI

### Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilado**: TailwindCSS, Shadcn UI
- **Estado**: React Query (TanStack Query)
- **Base de datos**: PostgreSQL con Prisma ORM
- **Calendario**: FullCalendar
- **Mapas**: Google Maps Places API
- **Validación**: Zod
- **Formularios**: React Hook Form

## Estructura del Proyecto

```
flete-mvp/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── clients/          # Endpoints de clientes
│   │   ├── services/         # Endpoints de servicios
│   │   └── export/           # Endpoint de exportación
│   ├── clients/              # Página de clientes
│   ├── services/             # Página de servicios
│   ├── reports/              # Página de reportes
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Página inicio (calendario)
│   └── globals.css           # Estilos globales
├── components/
│   ├── calendar/             # Componentes del calendario
│   ├── clients/              # Componentes de clientes
│   ├── services/             # Componentes de servicios
│   ├── maps/                 # Componentes de mapas
│   ├── layout/               # Componentes de layout (Sidebar, Header)
│   ├── ui/                   # Componentes UI de Shadcn
│   └── providers.tsx         # Providers de React Query
├── lib/
│   ├── api/                  # Funciones de API
│   │   ├── clients.ts
│   │   └── services.ts
│   ├── db.ts                 # Cliente de Prisma
│   └── utils.ts              # Utilidades
├── prisma/
│   └── schema.prisma         # Esquema de base de datos
├── DATABASE_DESIGN.md        # Documentación de la BD
├── DEPLOYMENT.md             # Guía de deployment
├── ROADMAP.md                # Roadmap de desarrollo
└── package.json
```

## Inicio Rápido

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- Cuenta de Google Cloud (para Maps API)

### Instalación

1. **Clonar el repositorio**
   ```bash
   cd flete-mvp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Edita `.env` y configura:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/flete_db"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_aqui"
   ```

4. **Ejecutar migraciones de base de datos**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generar cliente de Prisma**
   ```bash
   npx prisma generate
   ```

6. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

7. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npx prisma studio` - Abre Prisma Studio (interfaz visual de BD)
- `npx prisma migrate dev` - Crea y aplica migraciones

## Configuración de Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de "Places API"
4. Crea credenciales (API Key)
5. Configura restricciones de dominio (opcional pero recomendado)
6. Copia la API Key en tu archivo `.env`

## Base de Datos

### Modelos Principales

- **Client**: Clientes que contratan servicios
- **Service**: Servicios agendados (fletes, mudanzas, escombros)
- **User**: Usuarios del sistema (para futuro)

Ver [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) para más detalles.

### Seed de Datos (Opcional)

Para poblar la base de datos con datos de prueba:

```bash
npx prisma db seed
```

## Deployment

Ver la guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deployment Rápido en Vercel + Neon

1. **Base de datos en Neon**
   - Crea una cuenta en [Neon.tech](https://neon.tech)
   - Crea un nuevo proyecto PostgreSQL
   - Copia la connection string

2. **Deploy en Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Configurar variables de entorno en Vercel**
   - `DATABASE_URL`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

4. **Ejecutar migraciones**
   ```bash
   vercel env pull
   npx prisma migrate deploy
   ```

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el plan de desarrollo completo.

### Próximas Características (v2.0)

- Notificaciones por WhatsApp
- Dashboard con métricas
- Filtros avanzados
- Imágenes de servicios
- Historial de cambios

## Contribuir

Este es un proyecto MVP interno. Para sugerencias o bugs, por favor contacta al equipo de desarrollo.

## Licencia

Proyecto privado - Todos los derechos reservados

## Soporte

Para soporte, contacta a:
- Email: soporte@ejemplo.com
- Teléfono: +56 9 XXXX XXXX

---

**Desarrollado con Next.js 14 y Shadcn UI**
# Deploy
