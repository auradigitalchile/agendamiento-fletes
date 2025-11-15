# Estructura Completa del Proyecto

## Árbol de Archivos

```
flete-mvp/
│
├── app/                                    # Next.js 14 App Router
│   ├── api/                                # API Routes (Backend)
│   │   ├── clients/                        # Endpoints de clientes
│   │   │   ├── route.ts                    # GET, POST /api/clients
│   │   │   └── [id]/
│   │   │       └── route.ts                # GET, PUT, DELETE /api/clients/:id
│   │   ├── services/                       # Endpoints de servicios
│   │   │   ├── route.ts                    # GET, POST /api/services
│   │   │   └── [id]/
│   │   │       └── route.ts                # GET, PUT, DELETE /api/services/:id
│   │   └── export/
│   │       └── route.ts                    # GET /api/export (CSV)
│   │
│   ├── clients/                            # Página de clientes
│   │   └── page.tsx                        # /clients
│   │
│   ├── services/                           # Página de servicios
│   │   └── page.tsx                        # /services
│   │
│   ├── reports/                            # Página de reportes
│   │   └── page.tsx                        # /reports
│   │
│   ├── layout.tsx                          # Layout principal (Sidebar + Content)
│   ├── page.tsx                            # Página de inicio (/) - Calendario
│   └── globals.css                         # Estilos globales + FullCalendar styles
│
├── components/                             # Componentes React
│   ├── calendar/
│   │   └── service-calendar.tsx            # Componente del calendario FullCalendar
│   │
│   ├── clients/
│   │   └── client-form.tsx                 # Formulario de crear/editar cliente
│   │
│   ├── services/
│   │   └── service-form.tsx                # Formulario dinámico de servicios
│   │
│   ├── maps/
│   │   ├── address-autocomplete.tsx        # Autocompletado de direcciones
│   │   └── google-maps-provider.tsx        # Provider de Google Maps
│   │
│   ├── layout/
│   │   ├── sidebar.tsx                     # Navegación lateral
│   │   └── header.tsx                      # Header de la página
│   │
│   ├── ui/                                 # Componentes UI de Shadcn
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   │
│   └── providers.tsx                       # React Query Provider
│
├── lib/                                    # Utilidades y helpers
│   ├── api/                                # Funciones de API (cliente)
│   │   ├── clients.ts                      # CRUD de clientes
│   │   └── services.ts                     # CRUD de servicios
│   │
│   ├── db.ts                               # Cliente de Prisma (singleton)
│   └── utils.ts                            # Utilidades generales (formatters, etc.)
│
├── prisma/                                 # Prisma ORM
│   └── schema.prisma                       # Esquema de base de datos
│
├── node_modules/                           # Dependencias (auto-generado)
│
├── .next/                                  # Build de Next.js (auto-generado)
│
├── .env                                    # Variables de entorno (NO SUBIR A GIT)
├── .env.example                            # Ejemplo de variables de entorno
├── .gitignore                              # Archivos ignorados por Git
│
├── package.json                            # Dependencias y scripts
├── package-lock.json                       # Lock de dependencias
│
├── tsconfig.json                           # Configuración de TypeScript
├── next.config.mjs                         # Configuración de Next.js
├── tailwind.config.ts                      # Configuración de Tailwind
├── postcss.config.mjs                      # Configuración de PostCSS
│
├── README.md                               # Documentación principal
├── DATABASE_DESIGN.md                      # Diseño de base de datos
├── DEPLOYMENT.md                           # Guía de deployment
├── ROADMAP.md                              # Roadmap de desarrollo
├── SETUP.md                                # Guía de instalación
└── PROJECT_STRUCTURE.md                    # Este archivo
```

---

## Descripción de Carpetas

### `/app`
Carpeta principal de Next.js 14 App Router. Contiene:
- **API Routes**: Backend serverless en `/api`
- **Páginas**: Cada carpeta es una ruta (`/clients`, `/services`, etc.)
- **Layout**: Layout global de la aplicación

### `/components`
Componentes React reutilizables:
- **calendar/**: Componentes del calendario
- **clients/**: Componentes de clientes
- **services/**: Componentes de servicios
- **maps/**: Componentes de Google Maps
- **layout/**: Sidebar, Header, etc.
- **ui/**: Componentes UI base de Shadcn

### `/lib`
Lógica de negocio y utilidades:
- **api/**: Funciones para llamar a los endpoints
- **db.ts**: Cliente de Prisma
- **utils.ts**: Helpers (formatPrice, formatDate, etc.)

### `/prisma`
Configuración de Prisma ORM:
- **schema.prisma**: Define el modelo de datos

---

## Flujo de Datos

### Crear un Servicio

```
Usuario → Formulario (service-form.tsx)
         ↓
         React Hook Form + Zod validation
         ↓
         onSubmit → createService() (lib/api/services.ts)
         ↓
         axios.post('/api/services')
         ↓
         API Route (app/api/services/route.ts)
         ↓
         Validación con Zod
         ↓
         prisma.service.create()
         ↓
         PostgreSQL
         ↓
         Response → React Query cache
         ↓
         Calendario actualizado automáticamente
```

### Leer Servicios

```
Componente → useQuery (React Query)
           ↓
           getServices() (lib/api/services.ts)
           ↓
           axios.get('/api/services')
           ↓
           API Route (app/api/services/route.ts)
           ↓
           prisma.service.findMany()
           ↓
           PostgreSQL
           ↓
           Response → React Query cache (con staleTime)
           ↓
           Renderizado en Calendario/Lista
```

---

## Convenciones de Código

### Nombres de Archivos

- **Componentes**: `kebab-case.tsx` (ej: `service-form.tsx`)
- **Tipos**: `PascalCase` (ej: `Service`, `Client`)
- **Funciones**: `camelCase` (ej: `getServices`, `createClient`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `API_URL`)

### Estructura de Componentes

```tsx
"use client" // Si usa hooks o estado

import { ... } // Imports externos
import { ... } // Imports locales

// Interfaces/Types
interface ComponentProps {
  ...
}

// Componente
export function Component({ props }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()

  // Queries/Mutations
  const { data } = useQuery(...)

  // Handlers
  const handleAction = () => {
    ...
  }

  // Render
  return (
    ...
  )
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema de validación
const schema = z.object({...})

// Handler
export async function GET(request: NextRequest) {
  try {
    // Lógica
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Mensaje" },
      { status: 500 }
    )
  }
}
```

---

## Dependencias Principales

### Producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 14.1.0 | Framework |
| react | 18.2.0 | UI Library |
| @prisma/client | 5.9.1 | ORM Cliente |
| @tanstack/react-query | 5.18.0 | State Management |
| @fullcalendar/react | 6.1.10 | Calendario |
| axios | 1.6.5 | HTTP Client |
| zod | 3.22.4 | Validación |
| react-hook-form | 7.49.3 | Formularios |
| tailwindcss | 3.3.0 | CSS Framework |
| lucide-react | 0.316.0 | Iconos |

### Desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| typescript | 5.x | Lenguaje |
| prisma | 5.9.1 | ORM CLI |
| eslint | 8.x | Linter |
| @types/* | - | Types de TS |

---

## Variables de Entorno

### Desarrollo (`.env`)

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Producción (Vercel)

Las mismas variables pero con valores de producción.

**IMPORTANTE**: Nunca subir `.env` a Git.

---

## Scripts NPM

```bash
npm run dev          # Desarrollo (puerto 3000)
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # ESLint
```

---

## Patrones Usados

### Server Components vs Client Components

- **Server Components** (default): Sin `"use client"`
  - Páginas estáticas
  - Layouts
  - Componentes sin interactividad

- **Client Components**: Con `"use client"`
  - Componentes con useState/useEffect
  - Formularios
  - Componentes interactivos

### Data Fetching

- **React Query**: Para todas las operaciones CRUD
- **Caché automático**: staleTime de 1 minuto
- **Optimistic Updates**: Para mejor UX
- **Invalidación**: Después de mutations

### Validación

- **Zod**: Esquemas de validación
- **React Hook Form**: Validación de formularios
- **API Routes**: Validación backend con Zod

### Estilos

- **Tailwind**: Utility-first CSS
- **Shadcn**: Componentes base
- **CSS Variables**: Para theming (en globals.css)

---

## Extensibilidad

### Agregar una Nueva Entidad

1. **Actualizar Prisma Schema**
   ```prisma
   model NewEntity {
     id String @id @default(cuid())
     // campos...
   }
   ```

2. **Crear Migración**
   ```bash
   npx prisma migrate dev --name add-new-entity
   ```

3. **Crear API Routes**
   - `/app/api/new-entity/route.ts`
   - `/app/api/new-entity/[id]/route.ts`

4. **Crear API Client**
   - `/lib/api/new-entity.ts`

5. **Crear Componentes**
   - `/components/new-entity/new-entity-form.tsx`
   - `/components/new-entity/new-entity-list.tsx`

6. **Crear Página**
   - `/app/new-entity/page.tsx`

7. **Agregar a Sidebar**
   - Editar `/components/layout/sidebar.tsx`

---

## Testing (Futuro)

Estructura sugerida para tests:

```
__tests__/
├── components/
│   ├── calendar/
│   ├── clients/
│   └── services/
├── lib/
│   └── utils.test.ts
└── api/
    ├── clients.test.ts
    └── services.test.ts
```

Tecnologías sugeridas:
- **Jest**: Test runner
- **React Testing Library**: Tests de componentes
- **MSW**: Mock de API

---

## Mejores Prácticas

1. **Siempre validar datos** con Zod en API routes
2. **Usar React Query** para todas las operaciones de datos
3. **Componentes pequeños y reutilizables**
4. **Tipado fuerte** con TypeScript
5. **Mensajes de error claros** para el usuario
6. **Loading states** en todas las acciones
7. **Confirmaciones** antes de eliminar
8. **Optimistic updates** para mejor UX

---

Para más detalles, consulta:
- [README.md](./README.md)
- [SETUP.md](./SETUP.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
