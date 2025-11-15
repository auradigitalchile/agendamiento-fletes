# 🚀 EMPEZAR AQUÍ

## Bienvenido a tu Sistema de Gestión de Fletes

Este es un MVP completo y funcional listo para usar.

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Abre la terminal en esta carpeta

```bash
cd C:\Users\papal\flete-mvp
```

### 2. Instala las dependencias

```bash
npm install
```

⏱️ **Tiempo**: ~2 minutos

### 3. Configura la base de datos

**Opción más fácil**: Usar Neon (gratis, en la nube)

1. Ve a [neon.tech](https://neon.tech)
2. Crea cuenta
3. Crea proyecto "flete-mvp"
4. Copia la connection string

**Opción local**: Usar PostgreSQL en tu máquina

1. Asegúrate de tener PostgreSQL instalado
2. Crea una base de datos llamada `flete_db`

### 4. Configura las variables de entorno

```bash
# Copiar el archivo de ejemplo
copy .env.example .env
```

Abre `.env` y pega tu connection string:

```env
# Neon:
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# O Local:
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/flete_db"

# Google Maps (puedes dejarlo vacío por ahora)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

### 5. Crea las tablas

```bash
npx prisma migrate dev --name init
```

⏱️ **Tiempo**: ~30 segundos

### 6. Inicia el servidor

```bash
npm run dev
```

### 7. Abre en el navegador

Ve a: [http://localhost:3000](http://localhost:3000)

---

## 🎯 ¿Qué puedo hacer ahora?

### Crear tu primer cliente

1. Click en "Clientes" (sidebar)
2. Click en "Nuevo Cliente"
3. Completa el formulario
4. Click "Crear"

### Crear tu primer servicio

1. Click en "Calendario" (sidebar)
2. Click en "Nuevo Servicio"
3. Selecciona el cliente
4. Completa los datos
5. Click "Crear"

### Ver el servicio en el calendario

El servicio aparecerá en la fecha que seleccionaste, con colores según el tipo:
- **Azul**: Flete
- **Verde**: Mudanza
- **Naranja**: Escombros

---

## 📚 Documentación

| Archivo | ¿Cuándo leerlo? |
|---------|-----------------|
| `QUICK_START.md` | Primero (guía de 5 min) |
| `SETUP.md` | Si tienes problemas con el setup |
| `README.md` | Para entender el proyecto completo |
| `DEPLOYMENT.md` | Cuando quieras subir a producción |
| `ROADMAP.md` | Para ver features futuras |
| `PROYECTO_COMPLETO.md` | Resumen ejecutivo completo |

---

## 🆘 ¿Algo no funciona?

### Error: "Cannot connect to database"

- Verifica que PostgreSQL está corriendo
- Verifica que el `DATABASE_URL` en `.env` es correcto

### Error: "Port 3000 already in use"

```bash
# Usa otro puerto
npm run dev -- -p 3001
```

### Error: "Google Maps is not defined"

- No te preocupes, puedes escribir direcciones manualmente
- Configura la API Key más tarde siguiendo `SETUP.md`

---

## ✅ Checklist de Inicio

- [ ] Instalé dependencias (`npm install`)
- [ ] Configuré `.env` con DATABASE_URL
- [ ] Ejecuté migraciones (`npx prisma migrate dev`)
- [ ] Inicié el servidor (`npm run dev`)
- [ ] Abrí http://localhost:3000
- [ ] Creé mi primer cliente
- [ ] Creé mi primer servicio

---

## 🚀 Próximos Pasos

1. **Usa el sistema** por unos días
2. **Anota** lo que te gustaría mejorar
3. **Lee el ROADMAP.md** para ver features planificadas
4. **Deploy a producción** cuando estés listo (ver DEPLOYMENT.md)

---

## 📊 ¿Qué incluye este proyecto?

- ✅ Calendario interactivo
- ✅ Gestión de clientes
- ✅ Gestión de servicios (Flete, Mudanza, Escombros)
- ✅ Formularios dinámicos
- ✅ Exportación CSV
- ✅ Filtros y búsqueda
- ✅ UI moderna
- ✅ Base de datos PostgreSQL
- ✅ Listo para producción

---

**Todo el código está en esta carpeta. No necesitas instalar nada más.**

**¡Comienza a gestionar tus fletes ahora mismo!**
