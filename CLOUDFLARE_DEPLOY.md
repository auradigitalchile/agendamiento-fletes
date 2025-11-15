# Deploy en Cloudflare Pages - Flete MVP

## ⚠️ Configuración Actual

El proyecto está configurado actualmente para **Render**, pero puedes hacer deploy en Cloudflare Pages siguiendo estos pasos.

## 🚀 Opción Recomendada: Dashboard de Cloudflare Pages

### Paso 1: Configurar en Cloudflare Dashboard

1. **Ir a Cloudflare Pages**
   - https://dash.cloudflare.com
   - Pages → Create a project

2. **Conectar GitHub**
   - Select repository: `AuraDigitalDevChile/agendamiento-flete`
   - Branch: `main`

3. **Configuración de Build**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: (dejar vacío)
   ```

4. **Variables de Entorno**
   Agregar estas variables en Settings → Environment Variables:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   NODE_ENV = production
   NEXT_PUBLIC_APP_URL = https://flete-mvp.pages.dev
   ```

5. **Deploy**
   - Click en "Save and Deploy"
   - Cloudflare automáticamente detectará nuevos pushes a `main`

### ❌ NO usar el comando de deploy

El comando `npx wrangler deploy` es para **Cloudflare Workers**, NO para Pages.

Cloudflare Pages hace deploy automáticamente cuando:
- Haces push a la rama `main`
- O manualmente desde el Dashboard

## ⚡ Limitaciones de Cloudflare Pages con Next.js

⚠️ **IMPORTANTE:** Cloudflare Pages tiene limitaciones con Next.js:

1. **No soporta completamente Next.js 14 App Router**
   - Algunas features dinámicas no funcionan
   - API Routes pueden tener problemas
   - ISR (Incremental Static Regeneration) no está soportado

2. **Alternativas Recomendadas para Next.js:**
   - ✅ **Vercel** (creadores de Next.js, compatibilidad 100%)
   - ✅ **Render** (buena compatibilidad, ya configurado)
   - ⚠️ **Cloudflare Pages** (compatibilidad parcial)

## 🔧 Si Quieres Usar Cloudflare Pages con CLI

Necesitas instalar el adaptador:

```bash
npm install --save-dev @cloudflare/next-on-pages
```

Y modificar `package.json`:

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy"
  }
}
```

Pero **NO lo recomiendo** porque:
- Agrega complejidad
- No todas las features de Next.js funcionan
- El dashboard es más simple

## 📊 Comparación de Plataformas

| Plataforma | Next.js Support | Setup | Precio Free |
|------------|----------------|-------|-------------|
| **Vercel** | 100% | Fácil | Generoso |
| **Render** | 95% | Fácil | 750h/mes |
| **Cloudflare Pages** | 70% | Medio | Ilimitado |

## ✅ Recomendación Final

**Para este proyecto (Next.js 14 App Router con API Routes):**

1. **Primera opción:** Vercel (máxima compatibilidad)
2. **Segunda opción:** Render (ya está configurado)
3. **Tercera opción:** Cloudflare Pages (solo si no usas features dinámicas)

## 🔄 Cambiar de Cloudflare a Render

Si prefieres usar Render (más compatible con Next.js):

1. Ve a https://dashboard.render.com/
2. New → Web Service
3. Connect repository: `AuraDigitalDevChile/agendamiento-flete`
4. Configuración:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start`
5. Agregar variables de entorno
6. Deploy

---

**Nota:** El proyecto ya tiene `render.yaml` configurado para Render.
