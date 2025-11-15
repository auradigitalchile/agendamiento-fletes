# 🚀 Guía Paso a Paso - Configurar Vercel

## ⏱️ Tiempo estimado: 5 minutos

---

## Paso 1: Abrir Vercel Dashboard

1. **Ir a:** https://vercel.com/dashboard
2. **Buscar tu proyecto:** `agendamiento-flete-alpha`
3. **Click** en el nombre del proyecto

---

## Paso 2: Ir a Settings

1. En la página del proyecto, busca el menú superior
2. **Click en:** `Settings` (pestaña arriba)

---

## Paso 3: Ir a Environment Variables

1. En el menú lateral izquierdo
2. **Click en:** `Environment Variables`

---

## Paso 4: Agregar Variable #1 - DATABASE_URL

1. **Click en:** `Add New` (botón arriba a la derecha)

2. **Llenar el formulario:**
   ```
   Key: DATABASE_URL

   Value: postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

   Environments:
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

3. **Click:** `Save`

---

## Paso 5: Agregar Variable #2 - NEXT_PUBLIC_APP_URL

1. **Click en:** `Add New` otra vez

2. **Llenar el formulario:**
   ```
   Key: NEXT_PUBLIC_APP_URL

   Value: https://agendamiento-flete-alpha.vercel.app

   Environments:
   ✅ Production
   ✅ Preview
   ✅ Development
   ```

3. **Click:** `Save`

---

## Paso 6: Agregar Variable #3 - NODE_ENV

1. **Click en:** `Add New` otra vez

2. **Llenar el formulario:**
   ```
   Key: NODE_ENV

   Value: production

   Environments:
   ✅ Production solamente (dejar Preview y Development SIN marcar)
   ```

3. **Click:** `Save`

---

## Paso 7: Verificar que estén configuradas

Deberías ver algo así en la lista:

```
DATABASE_URL          •••••••••••••••     Production, Preview, Development
NEXT_PUBLIC_APP_URL   https://...         Production, Preview, Development
NODE_ENV              production          Production
```

✅ Si ves las 3 variables, perfecto!

---

## Paso 8: Redeploy

1. **Click en:** `Deployments` (menú superior)
2. Busca el deployment más reciente (el primero de la lista)
3. **Click en los 3 puntos** (...) a la derecha
4. **Click en:** `Redeploy`
5. En el popup:
   - ❌ NO marcar "Use existing Build Cache"
   - ✅ Click `Redeploy`

---

## Paso 9: Esperar el Build

1. Verás una pantalla de "Building..."
2. **Espera 2-3 minutos** (es rápido)
3. Cuando diga "Ready" o "✓ Deployment Complete":

---

## Paso 10: Verificar la App

1. **Ir a:** https://agendamiento-flete-alpha.vercel.app/
2. **Deberías ver:**
   - ✅ Calendario visible (FullCalendar con vista mensual)
   - ✅ El servicio "hola juav - ESCOMBROS - $25000"
   - ✅ Botón "Nuevo Servicio" funcionando

---

## ❌ Si Algo Sale Mal

### Error: "No hay servicios registrados"

**Causa:** Las variables no se guardaron o el redeploy no terminó.

**Solución:**
1. Verifica que las 3 variables estén en Settings → Environment Variables
2. Haz otro redeploy sin cache
3. Espera a que termine completamente

### Error: "Internal Server Error"

**Causa:** DATABASE_URL tiene un error de tipeo

**Solución:**
1. Ve a Settings → Environment Variables
2. Click en los 3 puntos de DATABASE_URL → Edit
3. Copia de nuevo exactamente:
   ```
   postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save y Redeploy

---

## 🔍 Ver Logs de Errores

Si necesitas ver qué está fallando exactamente:

1. **Deployments** → Click en el deployment activo
2. **Runtime Logs** (pestaña)
3. Busca líneas rojas o que digan "Error"

---

## ✅ Confirmación Final

Cuando todo funcione, deberías poder:

- ✅ Ver el calendario en la página principal
- ✅ Click en una fecha para crear servicio
- ✅ Ver servicios existentes en el calendario
- ✅ Click en un servicio para editarlo

---

**🎯 Si sigues estos pasos exactamente, debería funcionar al 100%**

**⏰ Si el build falla, avísame y te ayudo a revisar los logs de error.**
