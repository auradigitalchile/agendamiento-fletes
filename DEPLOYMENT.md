# Guía de Deployment - Flete MVP

Esta guía te ayudará a desplegar tu aplicación en producción usando Vercel y Neon (PostgreSQL).

## Opción 1: Vercel + Neon (Recomendado)

### Paso 1: Configurar Base de Datos en Neon

1. **Crear cuenta en Neon**
   - Ve a [https://neon.tech](https://neon.tech)
   - Regístrate con GitHub o email
   - Verifica tu cuenta

2. **Crear proyecto PostgreSQL**
   - Click en "Create Project"
   - Nombre del proyecto: `flete-mvp`
   - Región: Selecciona la más cercana (ej: US East)
   - PostgreSQL version: 15
   - Click "Create Project"

3. **Obtener Connection String**
   - En el dashboard, ve a "Connection Details"
   - Copia la connection string
   - Formato: `postgresql://user:password@host/database?sslmode=require`
   - Guárdala para el siguiente paso

### Paso 2: Preparar el Proyecto

1. **Asegurar que el proyecto está en Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Subir a GitHub**
   ```bash
   # Crear repositorio en GitHub primero
   git remote add origin https://github.com/tu-usuario/flete-mvp.git
   git branch -M main
   git push -u origin main
   ```

### Paso 3: Deploy en Vercel

1. **Instalar Vercel CLI (opcional)**
   ```bash
   npm install -g vercel
   ```

2. **Importar proyecto en Vercel**
   - Ve a [https://vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Importa tu repositorio de GitHub
   - Click "Import"

3. **Configurar Variables de Entorno**

   En la página de configuración del proyecto, agrega:

   - `DATABASE_URL`: Tu connection string de Neon
     ```
     postgresql://user:password@host/database?sslmode=require
     ```

   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Tu API Key de Google Maps
     ```
     AIza...
     ```

4. **Deploy**
   - Click "Deploy"
   - Espera a que termine el build (2-3 minutos)

### Paso 4: Ejecutar Migraciones

1. **Desde tu máquina local**
   ```bash
   # Descargar variables de entorno de Vercel
   vercel env pull

   # Ejecutar migraciones
   npx prisma migrate deploy
   ```

2. **Verificar que funcionó**
   - Ve a Neon Dashboard
   - Abre el Query Editor
   - Ejecuta: `SELECT * FROM "clients";`
   - Deberías ver las tablas creadas

### Paso 5: Verificar el Deployment

1. Abre la URL de Vercel (ej: `https://flete-mvp.vercel.app`)
2. Verifica que:
   - El sitio carga correctamente
   - Puedes crear un cliente
   - Puedes crear un servicio
   - El calendario muestra los servicios
   - El autocompletado de direcciones funciona

---

## Opción 2: Vercel + Supabase

### Paso 1: Configurar Base de Datos en Supabase

1. **Crear cuenta en Supabase**
   - Ve a [https://supabase.com](https://supabase.com)
   - Regístrate con GitHub

2. **Crear proyecto**
   - Click "New Project"
   - Organization: Crea una nueva o usa existente
   - Nombre: `flete-mvp`
   - Database Password: Genera una contraseña segura
   - Región: Selecciona la más cercana
   - Click "Create new project"

3. **Obtener Connection String**
   - Ve a Settings → Database
   - Copia "Connection String" (modo Transaction)
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña

### Paso 2: Deploy en Vercel

Sigue los mismos pasos que la Opción 1, pero usando la connection string de Supabase.

---

## Opción 3: Railway

### Paso 1: Crear cuenta en Railway

1. Ve a [https://railway.app](https://railway.app)
2. Regístrate con GitHub

### Paso 2: Crear proyecto

1. Click "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio
4. Railway detectará automáticamente Next.js

### Paso 3: Agregar PostgreSQL

1. Click "+ New" en tu proyecto
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos

### Paso 4: Configurar Variables de Entorno

1. Ve a tu servicio de Next.js
2. Tab "Variables"
3. Agrega:
   - `DATABASE_URL`: Click en "Reference" y selecciona `DATABASE_URL` del servicio de PostgreSQL
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Tu API Key

### Paso 5: Deploy

Railway desplegará automáticamente. Las migraciones se ejecutarán con el script `postinstall`.

---

## Configuración Adicional

### Custom Domain

**Vercel:**
1. Ve a Settings → Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones

**Railway:**
1. Settings → Networking → Custom Domain
2. Agrega tu dominio
3. Configura CNAME en tu proveedor de DNS

### Monitoreo

**Vercel:**
- Analytics está incluido
- Ve a Analytics tab para ver métricas

**Railway:**
- Métricas básicas en el dashboard
- Considera agregar Sentry para error tracking

### Backups

**Neon:**
- Backups automáticos incluidos
- Point-in-time recovery disponible

**Supabase:**
- Backups automáticos diarios
- Descarga manual desde Dashboard → Database → Backups

**Railway:**
- Backups automáticos
- Restauración desde Dashboard → Database → Backups

---

## Troubleshooting

### Error: "Cannot connect to database"

1. Verifica que `DATABASE_URL` está configurada correctamente
2. Asegúrate de que incluye `?sslmode=require` al final
3. Verifica que la IP de Vercel no está bloqueada

### Error: "Google Maps API not loaded"

1. Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está configurada
2. Asegúrate de que Places API está habilitada en Google Cloud
3. Verifica que el dominio está en la whitelist de la API Key

### Migraciones no se ejecutan

```bash
# Forzar ejecución de migraciones
vercel env pull
npx prisma migrate deploy
```

### Build falla en Vercel

1. Verifica que todas las dependencias están en `package.json`
2. Asegúrate de que no hay errores de TypeScript
3. Revisa los logs de build en Vercel

---

## Comandos Útiles

```bash
# Ver logs en tiempo real (Vercel)
vercel logs

# Ver variables de entorno
vercel env ls

# Ejecutar comando en producción
vercel exec -- npx prisma migrate deploy

# Rollback de deployment
vercel rollback

# Ver status del proyecto
vercel inspect
```

---

## Checklist de Deployment

- [ ] Base de datos creada en Neon/Supabase
- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Sitio accesible en la URL de producción
- [ ] CRUD de clientes funciona
- [ ] CRUD de servicios funciona
- [ ] Calendario muestra eventos
- [ ] Google Maps autocomplete funciona
- [ ] Exportación CSV funciona
- [ ] Custom domain configurado (opcional)
- [ ] Analytics configurado (opcional)

---

## Soporte

Si tienes problemas durante el deployment:

1. Revisa los logs de Vercel
2. Verifica la configuración de variables de entorno
3. Asegúrate de que las migraciones se ejecutaron correctamente
4. Contacta al equipo de desarrollo

---

**¡Felicidades! Tu aplicación está en producción**
