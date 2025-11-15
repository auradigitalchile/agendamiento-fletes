# 📦 Cómo subir el código a GitHub

## Opción 1: Desde GitHub Web (más fácil)

1. Ve a: https://github.com/auradigitalchile/agendamiento-fletes
2. Click en **"Add file"** → **"Upload files"**
3. Arrastra toda la carpeta `flete-mvp` (excepto `node_modules` y `.next`)
4. Commit message: "Initial commit - MVP funcionando localmente"
5. Click **"Commit changes"**

## Opción 2: Agregar colaborador y usar git

1. Ve a: https://github.com/auradigitalchile/agendamiento-fletes/settings/access
2. Click **"Add people"**
3. Busca: `AndresEcom`
4. Agregar como **Admin**
5. Luego en tu terminal:

```bash
cd C:\Users\papal\flete-mvp
git push -u origin main --force
```

## Opción 3: Que Angelo lo suba

Dale acceso a Angelo a tu carpeta y que él ejecute:

```bash
cd C:\Users\papal\flete-mvp
git push -u origin main --force
```

---

## ⚠️ IMPORTANTE: No subas estos archivos

- `node_modules/` (ya está en .gitignore)
- `.next/` (ya está en .gitignore)
- `.env` (SI se debe subir para el ejemplo, pero cambiar credenciales después)

---

## 🔐 Variables para Vercel (después del deploy)

```
DATABASE_URL = postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

NODE_ENV = production
```
