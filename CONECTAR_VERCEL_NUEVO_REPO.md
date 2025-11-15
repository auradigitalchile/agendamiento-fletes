# 🔄 Conectar Vercel al Nuevo Repositorio

Tu código ahora está en: **AuraDigitalDevChile/agendamiento-flete**

---

## ✅ Opción Recomendada: Crear Nuevo Proyecto en Vercel

Esta es la forma más limpia y evita problemas de caché.

### Paso 1: Ir a Vercel Dashboard

1. **Ir a:** https://vercel.com/dashboard
2. **Click:** Botón `Add New...` (arriba derecha)
3. **Seleccionar:** `Project`

### Paso 2: Importar Repositorio

1. Verás una lista de repositorios
2. **Buscar:** `AuraDigitalDevChile/agendamiento-flete`
3. Si no aparece, click en `Adjust GitHub App Permissions` y darle acceso a AuraDigitalDevChile
4. **Click:** `Import` en el repositorio

### Paso 3: Configurar Build Settings

Vercel detectará automáticamente Next.js. Dejar todo por defecto:

```
Framework Preset: Next.js
Build Command: (default - npm run build)
Output Directory: (default - .next)
Install Command: (default - npm install)
Root Directory: (default - ./)
```

**Click:** `Continue` o `Next`

### Paso 4: Agregar Environment Variables (IMPORTANTE)

Antes de hacer deploy, agregar estas 3 variables:

**Click en:** `Add Environment Variable`

#### Variable #1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
Environments: ✅ Production, ✅ Preview, ✅ Development
```

#### Variable #2: NEXT_PUBLIC_APP_URL
```
Key: NEXT_PUBLIC_APP_URL
Value: (Vercel te dará la URL, por ahora deja este campo vacío)
Environments: ✅ Production, ✅ Preview, ✅ Development
```

#### Variable #3: NODE_ENV
```
Key: NODE_ENV
Value: production
Environments: ✅ Production
```

### Paso 5: Deploy

1. **Click:** `Deploy`
2. **Esperar 2-3 minutos** mientras Vercel construye el proyecto
3. Vercel te mostrará una URL como: `https://agendamiento-flete-xxxxx.vercel.app`

### Paso 6: Actualizar NEXT_PUBLIC_APP_URL

1. **Copiar la URL** que Vercel te dio (ej: https://agendamiento-flete-xxxxx.vercel.app)
2. **Ir a:** Settings → Environment Variables
3. **Editar** `NEXT_PUBLIC_APP_URL`:
   - Click en los 3 puntos → Edit
   - Pegar la URL de producción
   - Save
4. **Redeploy:**
   - Deployments → Click en el último → 3 puntos → Redeploy

### Paso 7: Verificar que Funcione

1. **Abrir:** Tu nueva URL de Vercel
2. **Deberías ver:**
   - ✅ Calendario visible
   - ✅ Botón "Nuevo Servicio" funcionando
   - ✅ El servicio existente ("hola juav - ESCOMBROS") si ya existe

---

## 🗑️ Opcional: Eliminar Proyecto Antiguo

Si todo funciona bien, puedes eliminar el proyecto antiguo:

1. **Ir a:** https://vercel.com/dashboard
2. **Click en:** `agendamiento-flete-alpha` (el antiguo)
3. **Settings** → **General**
4. Scroll hasta abajo
5. **Click:** `Delete Project`
6. Confirmar escribiendo el nombre del proyecto

---

## 🔧 Alternativa: Reconectar Proyecto Existente

Si prefieres mantener el mismo proyecto y solo cambiar el repositorio:

### Paso 1: Desconectar Repo Antiguo

1. **Ir a:** https://vercel.com/dashboard
2. **Click en:** `agendamiento-flete-alpha`
3. **Settings** → **Git**
4. **Click:** `Disconnect` (desconectar el repo `AndresEcom/Proyectos-2025`)

### Paso 2: Conectar Nuevo Repo

1. **Click:** `Connect Git Repository`
2. **Seleccionar:** `AuraDigitalDevChile/agendamiento-flete`
3. **Branch:** `main`
4. **Save**

### Paso 3: Verificar Variables de Entorno

1. **Settings** → **Environment Variables**
2. Verificar que estén las 3 variables:
   - DATABASE_URL
   - NEXT_PUBLIC_APP_URL
   - NODE_ENV

### Paso 4: Redeploy

1. **Deployments** → Click en último deployment
2. **3 puntos** → `Redeploy`
3. Esperar a que termine

---

## ✅ Auto-Deploy Habilitado

Desde ahora, cada vez que hagas:

```bash
git add .
git commit -m "mensaje"
git push
```

Vercel automáticamente:
1. Detectará el push a `main`
2. Hará build del proyecto
3. Desplegará automáticamente

🎯 **No necesitas hacer nada manual cada vez que hagas cambios!**

---

## 📍 URLs Importantes

- **Nuevo Repo:** https://github.com/AuraDigitalDevChile/agendamiento-flete
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Console:** https://console.neon.tech/

---

## ❓ ¿Qué Opción Elegir?

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **Crear Nuevo Proyecto** | Limpio, sin cache antiguo, URL nueva | Necesitas configurar todo de nuevo |
| **Reconectar Existente** | Mantiene misma URL y configuración | Puede tener cache del repo anterior |

**Recomendación:** Crear nuevo proyecto si no te importa cambiar la URL.

---

**¿Algún problema? Avísame y te ayudo!** 🚀
