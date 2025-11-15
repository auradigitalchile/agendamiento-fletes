# Guía de Setup - Flete MVP

Esta guía te ayudará a configurar el proyecto desde cero en tu máquina local.

## Requisitos del Sistema

### Software Necesario

- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **PostgreSQL**: v14.0 o superior
- **Git**: Para control de versiones

### Verificar Instalaciones

```bash
node --version   # Debe mostrar v18.0.0 o superior
npm --version    # Debe mostrar v9.0.0 o superior
psql --version   # Debe mostrar v14.0 o superior
git --version    # Cualquier versión reciente
```

---

## Paso 1: Obtener el Código

### Opción A: Clonar desde Git (si ya existe)

```bash
git clone https://github.com/tu-usuario/flete-mvp.git
cd flete-mvp
```

### Opción B: Usar el código existente

Si ya tienes el código en `C:\Users\papal\flete-mvp`, simplemente navega a esa carpeta:

```bash
cd C:\Users\papal\flete-mvp
```

---

## Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`. Puede tomar 2-3 minutos.

---

## Paso 3: Configurar Base de Datos PostgreSQL

### Opción A: PostgreSQL Local

1. **Instalar PostgreSQL**
   - Windows: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql-14`

2. **Iniciar PostgreSQL**
   ```bash
   # Windows (como servicio, ya debería estar corriendo)
   # macOS
   brew services start postgresql@14
   # Linux
   sudo systemctl start postgresql
   ```

3. **Crear Base de Datos**
   ```bash
   # Conectarse a PostgreSQL
   psql -U postgres

   # Crear base de datos
   CREATE DATABASE flete_db;

   # Crear usuario (opcional)
   CREATE USER flete_user WITH PASSWORD 'tu_password_seguro';
   GRANT ALL PRIVILEGES ON DATABASE flete_db TO flete_user;

   # Salir
   \q
   ```

### Opción B: Usar Neon (PostgreSQL en la nube)

1. Ve a [neon.tech](https://neon.tech)
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Copia la connection string

### Opción C: Usar Supabase (PostgreSQL en la nube)

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Ve a Settings → Database
5. Copia la connection string

---

## Paso 4: Configurar Variables de Entorno

1. **Copiar el archivo de ejemplo**
   ```bash
   cp .env.example .env
   ```

2. **Editar `.env`**

   Abre el archivo `.env` en tu editor favorito y configura:

   ```env
   # Base de datos PostgreSQL
   # Local
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/flete_db"

   # O Neon/Supabase
   # DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

   # Google Maps API Key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_aqui"

   # URL de la aplicación (local)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

---

## Paso 5: Obtener Google Maps API Key

1. **Ve a Google Cloud Console**
   - [console.cloud.google.com](https://console.cloud.google.com)

2. **Crear o seleccionar un proyecto**
   - Click en el selector de proyectos
   - "New Project" → Nombre: "Flete MVP"

3. **Habilitar Places API**
   - Menu → APIs & Services → Library
   - Busca "Places API"
   - Click "Enable"

4. **Crear API Key**
   - APIs & Services → Credentials
   - "Create Credentials" → "API Key"
   - Copia la API Key

5. **Configurar restricciones (Recomendado)**
   - Click en la API Key creada
   - "Application restrictions" → "HTTP referrers"
   - Agregar: `http://localhost:3000/*`
   - "API restrictions" → "Restrict key"
   - Seleccionar: "Places API"
   - Save

6. **Pegar en `.env`**
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."
   ```

---

## Paso 6: Ejecutar Migraciones de Base de Datos

```bash
# Crear las tablas en la base de datos
npx prisma migrate dev --name init

# Generar el cliente de Prisma
npx prisma generate
```

Si todo salió bien, verás:

```
✔ Generated Prisma Client
```

### Verificar que funcionó

```bash
# Abrir Prisma Studio (interfaz visual)
npx prisma studio
```

Se abrirá en `http://localhost:5555`. Deberías ver las tablas:
- users
- clients
- services

---

## Paso 7: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Deberías ver:

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.5s
```

---

## Paso 8: Verificar que Todo Funciona

1. **Abrir en el navegador**
   - Ve a [http://localhost:3000](http://localhost:3000)

2. **Crear un cliente**
   - Click en "Clientes" en el sidebar
   - Click en "Nuevo Cliente"
   - Completa el formulario
   - Click "Crear"

3. **Crear un servicio**
   - Click en "Calendario" en el sidebar
   - Click en "Nuevo Servicio"
   - Selecciona el cliente
   - Selecciona tipo de servicio
   - Completa los datos
   - **Prueba el autocompletado de direcciones** (debería funcionar)
   - Click "Crear"

4. **Verificar en el calendario**
   - El servicio debería aparecer en la fecha seleccionada
   - Con el color correspondiente al tipo

---

## Troubleshooting

### Error: "Cannot connect to database"

**Causa**: La base de datos no está corriendo o la URL está mal configurada

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
# Windows
services.msc  # Buscar "postgresql" y verificar que está "Running"

# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Probar conexión
psql -U postgres -d flete_db
```

### Error: "Google Maps is not defined"

**Causa**: La API Key no está configurada o es inválida

**Solución**:
1. Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está en `.env`
2. Verifica que la API Key es válida
3. Verifica que Places API está habilitada en Google Cloud
4. Reinicia el servidor de desarrollo (`Ctrl+C` y `npm run dev`)

### Error: "Prisma Client not generated"

**Solución**:
```bash
npx prisma generate
```

### El puerto 3000 ya está en uso

**Solución**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
npm run dev -- -p 3001
```

### Cambios en el código no se reflejan

**Solución**:
1. Verifica que guardaste el archivo
2. El Hot Reload debería funcionar automáticamente
3. Si no, reinicia el servidor (`Ctrl+C` y `npm run dev`)
4. Limpia caché: `rm -rf .next` y reinicia

---

## Datos de Prueba (Opcional)

### Crear datos de prueba manualmente

1. **Abrir Prisma Studio**
   ```bash
   npx prisma studio
   ```

2. **Crear clientes**
   - Tab "clients"
   - "Add record"
   - Completa los campos
   - "Save 1 change"

3. **Crear servicios**
   - Tab "services"
   - "Add record"
   - Selecciona un cliente (relation)
   - Completa los campos
   - "Save 1 change"

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar linter

# Base de datos
npx prisma studio        # Interfaz visual de BD
npx prisma migrate dev   # Crear migración
npx prisma migrate reset # Resetear BD (CUIDADO: borra datos)
npx prisma db push       # Sincronizar schema sin migración
npx prisma generate      # Generar cliente de Prisma

# Git
git status               # Ver cambios
git add .                # Agregar todos los cambios
git commit -m "mensaje"  # Crear commit
git push                 # Subir cambios
```

---

## Siguiente Paso

Una vez que todo esté funcionando:

1. Lee el [README.md](./README.md) para entender la estructura
2. Revisa [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) para entender el modelo de datos
3. Comienza a usar la aplicación y reporta bugs
4. Consulta el [ROADMAP.md](./ROADMAP.md) para ver features futuras

---

## Soporte

Si tienes problemas:

1. Revisa esta guía completamente
2. Busca el error en Google
3. Revisa los issues de GitHub (si aplica)
4. Contacta al equipo de desarrollo

---

**¡Listo! Ya tienes el proyecto corriendo localmente**
