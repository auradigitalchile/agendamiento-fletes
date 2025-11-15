# Guía de Deploy - Flete MVP

## Requisitos Previos

- Cuenta en [Render.com](https://render.com)
- Base de datos PostgreSQL en [Neon](https://neon.tech) (ya configurada)
- Repositorio en GitHub

## Variables de Entorno

Necesitarás configurar las siguientes variables de entorno en Render:

```env
DATABASE_URL=postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_APP_URL=https://tu-app.onrender.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(opcional)
NODE_ENV=production
```

## Pasos para Deploy en Render

### 1. Conectar Repositorio

1. Ir a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "Web Service"
3. Conectar tu repositorio de GitHub: `AndresEcom/Proyectos-2025`

### 2. Configurar el Servicio

**Configuración básica:**
- **Name:** `flete-mvp` (o el nombre que prefieras)
- **Region:** Oregon (Free)
- **Branch:** `main`
- **Root Directory:** (dejar vacío)
- **Runtime:** Node
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm run start`

### 3. Configurar Variables de Entorno

En la sección "Environment Variables", agregar:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Tu URL de conexión de Neon |
| `NEXT_PUBLIC_APP_URL` | `https://tu-app.onrender.com` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | (opcional) |

### 4. Plan

- Seleccionar **Free Plan** ($0/mes)
- Nota: El plan free tiene las siguientes limitaciones:
  - Se apaga después de 15 minutos de inactividad
  - 750 horas/mes de uso

### 5. Deploy

1. Click en "Create Web Service"
2. Render automáticamente:
   - Clonará el repositorio
   - Ejecutará `npm install`
   - Generará Prisma Client
   - Construirá la aplicación con `npm run build`
   - Iniciará el servidor con `npm run start`

### 6. Verificar Database Schema

Después del primer deploy, es recomendable sincronizar el schema de Prisma:

```bash
# Esto ya se hace automáticamente con Prisma
# El schema está sincronizado con Neon
```

### 7. Acceder a tu Aplicación

Una vez completado el deploy, tu aplicación estará disponible en:
```
https://flete-mvp.onrender.com
```
(o el nombre que hayas elegido)

## Auto-Deploy

Render está configurado para hacer deploy automático cada vez que hagas push a la rama `main` en GitHub.

## Monitoreo

- Ver logs en tiempo real desde Render Dashboard
- Métricas de uso y rendimiento disponibles en el dashboard

## Troubleshooting

### Error de conexión a base de datos
- Verificar que la variable `DATABASE_URL` esté correctamente configurada
- Verificar que Neon permita conexiones desde Render

### Build fallido
- Revisar los logs de build en Render
- Verificar que todas las dependencias estén en `package.json`

### Aplicación lenta al iniciar
- Es normal en el plan Free de Render
- La primera petición después de 15 minutos de inactividad puede tardar 30-60 segundos

## Comandos Útiles

```bash
# Ver logs
render logs

# Reiniciar servicio (desde dashboard)

# Ejecutar migraciones de Prisma (si es necesario)
# Se puede hacer desde el shell de Render
npx prisma db push
```

## Próximos Pasos

1. Configurar dominio personalizado (opcional)
2. Configurar Google Maps API Key para autocompletado de direcciones
3. Configurar notificaciones por email/SMS
4. Implementar sistema de respaldos de base de datos

## Notas Importantes

- La base de datos Neon ya está configurada y en producción
- No es necesario ejecutar migraciones, el schema ya está sincronizado
- El plan Free de Render es suficiente para MVP y testing
- Para producción con tráfico alto, considerar actualizar a plan pago
