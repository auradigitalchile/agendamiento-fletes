# Guía de Inicio Rápido - 5 Minutos

Esta guía te ayudará a tener el proyecto funcionando en menos de 5 minutos.

## Prerrequisitos

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado (o cuenta en Neon/Supabase)
- [ ] Git instalado

## Paso a Paso

### 1. Verificar que tienes el código

El proyecto debería estar en:
```
C:\Users\papal\flete-mvp\
```

### 2. Instalar dependencias

```bash
cd C:\Users\papal\flete-mvp
npm install
```

⏱️ Tiempo: ~2 minutos

### 3. Configurar base de datos

#### Opción A: PostgreSQL Local (Windows)

1. Abre pgAdmin o la terminal de PostgreSQL
2. Crea la base de datos:
   ```sql
   CREATE DATABASE flete_db;
   ```

#### Opción B: Neon (Cloud, más fácil)

1. Ve a [neon.tech](https://neon.tech)
2. Crea cuenta (gratis)
3. Crea proyecto "flete-mvp"
4. Copia la connection string

### 4. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
copy .env.example .env
```

Abre `.env` y configura:

```env
# Si usas PostgreSQL local:
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/flete_db"

# Si usas Neon, pega la connection string:
# DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Google Maps API Key (temporal, puedes configurarla después)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="pendiente"
```

### 5. Crear las tablas

```bash
npx prisma migrate dev --name init
```

⏱️ Tiempo: ~30 segundos

### 6. Iniciar el servidor

```bash
npm run dev
```

⏱️ Tiempo: ~10 segundos

### 7. Abrir en el navegador

Ve a: [http://localhost:3000](http://localhost:3000)

**¡Listo!** Deberías ver el calendario.

---

## Primeros Pasos en la Aplicación

### 1. Crear tu primer cliente

1. Click en "Clientes" en el sidebar
2. Click en "Nuevo Cliente"
3. Completa:
   - Nombre: "Juan Pérez"
   - Teléfono: "+56912345678"
4. Click "Crear"

### 2. Crear tu primer servicio

1. Click en "Calendario" en el sidebar
2. Click en "Nuevo Servicio"
3. Completa:
   - Cliente: Selecciona "Juan Pérez"
   - Tipo: "Flete"
   - Estado: "Confirmado"
   - Fecha: Hoy + 2 días
   - Precio: 50000
   - Origen: "Av. Libertador 123"
   - Destino: "Calle Principal 456"
4. Click "Crear"

### 3. Ver en el calendario

El servicio debería aparecer en el calendario en la fecha seleccionada, con color azul (Flete).

---

## Configurar Google Maps (Opcional)

Si quieres que funcione el autocompletado de direcciones:

### 1. Crear API Key

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto nuevo
3. Habilita "Places API"
4. Crea una API Key

### 2. Configurar en .env

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."
```

### 3. Reiniciar servidor

```bash
# Ctrl+C para detener
npm run dev
```

Ahora el autocompletado de direcciones funcionará.

---

## Comandos Útiles

```bash
# Ver base de datos visualmente
npx prisma studio

# Reiniciar base de datos (borra todos los datos)
npx prisma migrate reset

# Ver logs del servidor
# Los logs aparecen en la terminal donde corriste npm run dev
```

---

## Troubleshooting Rápido

### "Cannot connect to database"

**Solución**:
1. Verifica que PostgreSQL está corriendo
2. Verifica que el DATABASE_URL en .env es correcto
3. Prueba conectarte con pgAdmin

### "Port 3000 already in use"

**Solución**:
```bash
# Usa otro puerto
npm run dev -- -p 3001
```

### "Google Maps is not defined"

**Solución**:
- No te preocupes por ahora
- Puedes escribir las direcciones manualmente
- Configura la API Key cuando tengas tiempo

---

## Siguiente Paso

Lee el [README.md](./README.md) completo para entender mejor el proyecto.

---

## Soporte

Si algo no funciona:
1. Lee [SETUP.md](./SETUP.md) (guía detallada)
2. Verifica los logs en la terminal
3. Busca el error en Google

---

**¡Felicidades! Ya tienes tu sistema de gestión de fletes funcionando**

Ahora puedes:
- Agregar más clientes
- Agendar más servicios
- Usar el calendario
- Exportar reportes CSV
- ¡Y empezar a usarlo en tu negocio!
