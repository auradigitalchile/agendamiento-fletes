# 🚀 Deploy a Vercel - Repositorio Nuevo

**Repositorio:** https://github.com/auradigitalchile/agendamiento-fletes

---

## ✅ Paso 1: Crear Nuevo Proyecto en Vercel

### 1.1 Ir a Vercel Dashboard

1. **Ir a:** https://vercel.com/dashboard
2. **Click:** Botón `Add New...` (arriba derecha)
3. **Seleccionar:** `Project`

### 1.2 Importar Repositorio

1. Verás una lista de repositorios
2. **Buscar:** `auradigitalchile/agendamiento-fletes`
3. Si no aparece, click en `Adjust GitHub App Permissions` y darle acceso a `auradigitalchile`
4. **Click:** `Import` en el repositorio

### 1.3 Configurar Build Settings

Vercel detectará automáticamente Next.js. **Dejar todo por defecto:**

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: ./
Node.js Version: 18.x (o superior)
```

**Click:** `Continue`

---

## 🔐 Paso 2: Agregar Variables de Entorno

**IMPORTANTE:** Antes de hacer deploy, agregar estas variables:

**Click en:** `Environment Variables` (o durante setup inicial)

### Variable #1: DATABASE_URL

```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

Environments:
✅ Production
✅ Preview
✅ Development
```

### Variable #2: NODE_ENV

```
Key: NODE_ENV
Value: production

Environments:
✅ Production
```

### Variable #3: NEXT_PUBLIC_APP_URL (Opcional por ahora)

```
Key: NEXT_PUBLIC_APP_URL
Value: (Lo agregarás después con la URL que Vercel te dé)

Environments:
✅ Production
✅ Preview
✅ Development
```

---

## 🎯 Paso 3: Deploy

1. **Click:** `Deploy`
2. **Esperar 2-3 minutos** mientras Vercel construye el proyecto
3. Vercel te mostrará una URL como:
   ```
   https://agendamiento-fletes-xxxxx.vercel.app
   ```

### ✅ Qué debe pasar durante el build:

```
Running "npm install"...
✓ Dependencies installed

Running "npm run build"...
✓ Prisma generate completed
✓ Next.js build completed

Deploying...
✓ Deployment ready
```

---

## 🔧 Paso 4: Actualizar NEXT_PUBLIC_APP_URL (Opcional)

1. **Copiar la URL** que Vercel te dio (ej: https://agendamiento-fletes-xxxxx.vercel.app)
2. **Ir a:** Settings → Environment Variables
3. **Editar** `NEXT_PUBLIC_APP_URL`:
   - Click en los 3 puntos → Edit
   - Pegar la URL de producción
   - Save
4. **Redeploy:**
   - Deployments → Click en el último → 3 puntos → Redeploy

---

## ✨ Paso 5: Verificar que Funcione

Abre tu URL de Vercel y verifica:

### ✅ Checklist de Funcionalidades:

- [ ] Calendario visible (vista principal)
- [ ] Botón "Nuevo Servicio" funciona
- [ ] Formulario de servicio se abre
- [ ] Servicio existente "hola juav - ESCOMBROS" aparece (si existe en DB)
- [ ] Vista de Servicios muestra tabla con formato:
  - Fecha con hora (dd/MM/yyyy HH:mm)
  - Cliente
  - Tipo (badge azul/morado/verde)
  - Precio
  - Estado (badge naranja/azul/verde/rojo)
  - Botón de editar
- [ ] Al editar un servicio, se abre el formulario con datos pre-cargados
- [ ] Botón "Exportar CSV" funciona

---

## 🔄 Auto-Deploy Configurado

Desde ahora, cada vez que hagas:

```bash
cd C:\Users\papal\flete-mvp
git add .
git commit -m "mensaje del cambio"
git push
```

Vercel automáticamente:
1. ✅ Detectará el push a `main`
2. ✅ Ejecutará `npm install` y `npm run build`
3. ✅ Desplegará automáticamente
4. ✅ Te enviará notificación del resultado

**No necesitas hacer nada manual cada vez que hagas cambios.**

---

## 📊 Verificación de Base de Datos

Tu base de datos en Neon ya tiene:

```sql
-- Tabla: Service
-- Campos: id, clientName, clientPhone, serviceType, etc.
-- Registro existente: "hola juav" - ESCOMBROS
```

**No necesitas ejecutar migraciones** porque:
- La base de datos ya está creada
- El schema ya está aplicado
- Solo necesitas la variable `DATABASE_URL` en Vercel

---

## 🛠️ Troubleshooting

### Error: "Module not found: Can't resolve 'X'"

**Causa:** Dependencias no instaladas correctamente

**Solución:**
1. Verifica que `package.json` tenga todas las dependencias
2. Redeploy desde Vercel
3. Si persiste, agregar variable de entorno:
   ```
   NEXT_TELEMETRY_DISABLED=1
   ```

### Error: "Prisma Client not generated"

**Causa:** `postinstall` script no se ejecutó

**Solución:**
1. Verifica en `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
2. Si existe, Vercel lo ejecutará automáticamente
3. Redeploy

### Error: "Database connection failed"

**Causa:** `DATABASE_URL` mal configurada

**Solución:**
1. Verifica que la variable `DATABASE_URL` esté exactamente como:
   ```
   postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
2. Asegúrate que esté en los 3 environments (Production, Preview, Development)
3. Redeploy

---

## 📍 URLs Importantes

- **Repositorio:** https://github.com/auradigitalchile/agendamiento-fletes
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Console:** https://console.neon.tech/

---

## 🎯 Versiones Correctas

Asegúrate que tu código tenga estas versiones (ya las tienes):

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.9.1"
  },
  "devDependencies": {
    "prisma": "^5.9.1"
  }
}
```

**NO uses Next.js 16 ni React 19** - causan problemas de compatibilidad.

---

**¿Algún problema durante el deploy? Avísame y te ayudo.** 🚀
