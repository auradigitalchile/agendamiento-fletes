# Troubleshooting - Vercel Deploy

## Problema: No carga calendario ni servicios

URL: https://agendamiento-flete-alpha.vercel.app/

### Pasos para Resolver

#### 1. Verificar Variables de Entorno en Vercel

Ve a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

Debes tener configuradas estas variables:

```env
DATABASE_URL = postgresql://neondb_owner:npg_RHeg1P7IxDfS@ep-floral-dust-ahjwefzt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXT_PUBLIC_APP_URL = https://agendamiento-flete-alpha.vercel.app

NODE_ENV = production
```

**IMPORTANTE:**
- `DATABASE_URL` NO debe tener el prefijo `NEXT_PUBLIC_`
- Las variables que empiezan con `NEXT_PUBLIC_` son públicas
- Las que NO tienen ese prefijo son privadas (server-side only)

#### 2. Verificar Logs de Vercel

1. Ve a **Vercel Dashboard → Tu Proyecto → Deployments**
2. Click en el deployment activo
3. Ve a la pestaña **"Runtime Logs"**
4. Busca errores relacionados con:
   - `Prisma`
   - `DATABASE_URL`
   - `connection`
   - `ECONNREFUSED`

#### 3. Sincronizar Base de Datos

Si los logs muestran errores de schema, ejecuta localmente:

```bash
# Asegúrate de tener la DATABASE_URL en tu .env local
npx prisma db push

# O si prefieres migraciones
npx prisma migrate deploy
```

#### 4. Verificar Conexión a Neon

Prueba la conexión a la base de datos:

```bash
# Ejecutar localmente con la DATABASE_URL de producción
DATABASE_URL="postgresql://neondb_owner:..." npx prisma studio
```

Si Prisma Studio se abre, la conexión funciona.

#### 5. Re-deploy Forzado

Después de configurar las variables de entorno:

1. Ve a **Deployments**
2. Click en los 3 puntos del deployment actual
3. Click **"Redeploy"**
4. Espera a que termine el build

#### 6. Verificar Que Neon Esté Activo

1. Ve a https://console.neon.tech/
2. Verifica que tu proyecto esté **activo** (no suspendido)
3. Verifica que la connection string sea correcta

## Errores Comunes

### Error: "Prisma Client not configured"

**Solución:** Vercel necesita generar Prisma Client en build time.

Verifica que `package.json` tenga:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Error: "Cannot connect to database"

**Causas posibles:**
1. DATABASE_URL no configurada en Vercel
2. DATABASE_URL tiene formato incorrecto
3. Neon database está suspendida
4. Firewall bloqueando conexión desde Vercel

**Solución:**
- Verifica la connection string en Neon dashboard
- Copia exactamente como está (con `?sslmode=require`)

### Error: "Table 'Service' does not exist"

**Solución:** El schema no está sincronizado.

Ejecuta localmente:
```bash
DATABASE_URL="tu_url_de_producción" npx prisma db push
```

## Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] DATABASE_URL es correcta y accesible
- [ ] Neon database está activa
- [ ] Schema de Prisma está sincronizado
- [ ] Build de Vercel completó sin errores
- [ ] Runtime logs no muestran errores

## Comando de Emergencia

Si nada funciona, fuerza un rebuild completo:

1. Settings → General → "Delete Project" (NO hacer esto aún)
2. O simplemente: Deployments → Redeploy con "Clear Cache"

## URLs Importantes

- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech/
- Tu App: https://agendamiento-flete-alpha.vercel.app/
