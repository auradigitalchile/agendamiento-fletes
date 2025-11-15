# Diseño de Base de Datos - Flete MVP

## Diagrama ER (ASCII)

```
┌─────────────────────┐
│      User           │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ name                │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘


┌─────────────────────┐         ┌─────────────────────────┐
│      Client         │         │       Service           │
├─────────────────────┤         ├─────────────────────────┤
│ id (PK)             │◄────────┤ id (PK)                 │
│ name                │   1:N   │ clientId (FK)           │
│ phone               │         │ type (ENUM)             │
│ email               │         │ status (ENUM)           │
│ defaultAddress      │         │ scheduledDate           │
│ notes               │         │ price                   │
│ createdAt           │         │ origin                  │
│ updatedAt           │         │ destination             │
└─────────────────────┘         │ cargoDescription        │
                                │ requiresHelper          │
                                │ debrisType              │
                                │ debrisQuantity          │
                                │ notes                   │
                                │ createdAt               │
                                │ updatedAt               │
                                └─────────────────────────┘
```

## Tablas

### User
Usuarios del sistema (equipo interno).

| Campo      | Tipo      | Descripción                    |
|------------|-----------|--------------------------------|
| id         | String    | UUID, Primary Key              |
| email      | String    | Email único del usuario        |
| name       | String    | Nombre completo                |
| createdAt  | DateTime  | Fecha de creación              |
| updatedAt  | DateTime  | Fecha de actualización         |

### Client
Clientes que contratan los servicios.

| Campo          | Tipo      | Descripción                        |
|----------------|-----------|------------------------------------|
| id             | String    | UUID, Primary Key                  |
| name           | String    | Nombre del cliente                 |
| phone          | String    | Teléfono de contacto               |
| email          | String?   | Email opcional                     |
| defaultAddress | String?   | Dirección habitual                 |
| notes          | String?   | Notas internas sobre el cliente    |
| createdAt      | DateTime  | Fecha de creación                  |
| updatedAt      | DateTime  | Fecha de actualización             |

### Service
Servicios agendados (fletes, mudanzas, escombros).

| Campo            | Tipo            | Descripción                                    |
|------------------|-----------------|------------------------------------------------|
| id               | String          | UUID, Primary Key                              |
| clientId         | String          | FK a Client                                    |
| type             | ServiceType     | FLETE, MUDANZA, ESCOMBROS                      |
| status           | ServiceStatus   | PENDIENTE, CONFIRMADO, FINALIZADO, CANCELADO   |
| scheduledDate    | DateTime        | Fecha y hora del servicio                      |
| price            | Float           | Precio del servicio                            |
| origin           | String?         | Dirección de origen (flete/mudanza)            |
| destination      | String?         | Dirección de destino (flete/mudanza)           |
| cargoDescription | String?         | Descripción de la carga                        |
| requiresHelper   | Boolean         | ¿Requiere ayudante? (default: false)           |
| debrisType       | DebrisType?     | Tipo de escombro (OBRA, TIERRA, MADERA, etc.)  |
| debrisQuantity   | DebrisQuantity? | MEDIO_CAMION, LLENO                            |
| notes            | String?         | Notas internas del servicio                    |
| createdAt        | DateTime        | Fecha de creación                              |
| updatedAt        | DateTime        | Fecha de actualización                         |

## Enums

### ServiceType
- `FLETE` - Servicio de flete
- `MUDANZA` - Servicio de mudanza
- `ESCOMBROS` - Retiro de escombros

### ServiceStatus
- `PENDIENTE` - Servicio pendiente de confirmación
- `CONFIRMADO` - Servicio confirmado con cliente
- `FINALIZADO` - Servicio completado
- `CANCELADO` - Servicio cancelado

### DebrisType (tipo de escombro)
- `OBRA` - Escombros de obra
- `TIERRA` - Tierra
- `MADERA` - Madera
- `ARIDOS` - Áridos
- `MIXTO` - Mixto

### DebrisQuantity (cantidad de escombro)
- `MEDIO_CAMION` - Medio camión
- `LLENO` - Camión lleno

## Relaciones

- **Client → Service**: Un cliente puede tener muchos servicios (1:N)
- Los servicios de tipo FLETE y MUDANZA usan: origin, destination, cargoDescription, requiresHelper
- Los servicios de tipo ESCOMBROS usan: origin (dirección de retiro), debrisType, debrisQuantity

## Índices

- `Client.email` - Índice para búsqueda rápida por email
- `Service.clientId` - Foreign Key indexada automáticamente
- `Service.scheduledDate` - Índice para consultas por fecha
- `Service.status` - Índice para filtros por estado
