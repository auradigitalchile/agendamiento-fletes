# Paleta de Colores y Guía de UI

## Paleta de Colores

### Colores Principales

#### Primario (Azul)
- **Primary**: `hsl(221.2, 83.2%, 53.3%)` → #4F7DF5
- **Primary Foreground**: `hsl(210, 40%, 98%)` → #F8FAFC

#### Secundario (Gris Claro)
- **Secondary**: `hsl(210, 40%, 96.1%)` → #F1F5F9
- **Secondary Foreground**: `hsl(222.2, 47.4%, 11.2%)` → #1E293B

#### Background
- **Background**: `hsl(0, 0%, 100%)` → #FFFFFF
- **Foreground**: `hsl(222.2, 84%, 4.9%)` → #020617

### Colores por Tipo de Servicio

#### Flete (Azul)
- **Color**: `hsl(217, 91%, 60%)` → #5B9EF8
- **Fondo**: `hsl(217, 91%, 95%)` → #ECF5FF
- **Uso**: Eventos de tipo FLETE en el calendario

#### Mudanza (Verde)
- **Color**: `hsl(142, 76%, 36%)` → #16A34A
- **Fondo**: `hsl(142, 76%, 95%)` → #ECFDF5
- **Uso**: Eventos de tipo MUDANZA en el calendario

#### Escombros (Naranja)
- **Color**: `hsl(25, 95%, 53%)` → #FB7A16
- **Fondo**: `hsl(25, 95%, 95%)` → #FFF4ED
- **Uso**: Eventos de tipo ESCOMBROS en el calendario

### Colores de Estado

#### Pendiente (Amarillo)
- **Background**: `bg-yellow-100` → #FEF3C7
- **Text**: `text-yellow-800` → #92400E

#### Confirmado (Azul)
- **Background**: `bg-blue-100` → #DBEAFE
- **Text**: `text-blue-800` → #1E40AF

#### Finalizado (Verde)
- **Background**: `bg-green-100` → #DCFCE7
- **Text**: `text-green-800` → #166534

#### Cancelado (Rojo)
- **Background**: `bg-red-100` → #FEE2E2
- **Text**: `text-red-800` → #991B1B

### Colores Funcionales

#### Destructivo (Rojo)
- **Destructive**: `hsl(0, 84.2%, 60.2%)` → #EF4444
- **Destructive Foreground**: `hsl(210, 40%, 98%)` → #F8FAFC

#### Muted (Gris)
- **Muted**: `hsl(210, 40%, 96.1%)` → #F1F5F9
- **Muted Foreground**: `hsl(215.4, 16.3%, 46.9%)` → #64748B

#### Border
- **Border**: `hsl(214.3, 31.8%, 91.4%)` → #E2E8F0
- **Input**: `hsl(214.3, 31.8%, 91.4%)` → #E2E8F0
- **Ring**: `hsl(221.2, 83.2%, 53.3%)` → #4F7DF5

---

## Tipografía

### Font Family
- **Principal**: Inter (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### Tamaños

```css
text-xs     /* 0.75rem / 12px */
text-sm     /* 0.875rem / 14px */
text-base   /* 1rem / 16px */
text-lg     /* 1.125rem / 18px */
text-xl     /* 1.25rem / 20px */
text-2xl    /* 1.5rem / 24px */
text-3xl    /* 1.875rem / 30px */
```

### Pesos

```css
font-normal    /* 400 */
font-medium    /* 500 */
font-semibold  /* 600 */
font-bold      /* 700 */
```

---

## Componentes UI

### Botones

#### Variantes

**Default (Primario)**
```tsx
<Button>Guardar</Button>
// Azul, texto blanco, hover más oscuro
```

**Outline**
```tsx
<Button variant="outline">Cancelar</Button>
// Borde gris, fondo transparente, hover gris claro
```

**Ghost**
```tsx
<Button variant="ghost">Editar</Button>
// Sin borde, hover gris claro
```

**Destructive**
```tsx
<Button variant="destructive">Eliminar</Button>
// Rojo, texto blanco
```

#### Tamaños

```tsx
<Button size="sm">Pequeño</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><Icon /></Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
  <CardFooter>
    Acciones
  </CardFooter>
</Card>
```

- **Fondo**: Blanco
- **Borde**: Gris claro
- **Sombra**: Sutil (sm)
- **Hover**: Sombra más pronunciada (md)

### Badges

```tsx
// Tipo de servicio
<Badge className="bg-flete-light text-flete">Flete</Badge>
<Badge className="bg-mudanza-light text-mudanza">Mudanza</Badge>
<Badge className="bg-escombros-light text-escombros">Escombros</Badge>

// Estado
<Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
<Badge className="bg-blue-100 text-blue-800">Confirmado</Badge>
<Badge className="bg-green-100 text-green-800">Finalizado</Badge>
<Badge className="bg-red-100 text-red-800">Cancelado</Badge>
```

### Inputs

```tsx
<Input
  type="text"
  placeholder="Ingresa..."
  className="w-full"
/>
```

- **Altura**: 40px (h-10)
- **Padding**: 12px horizontal
- **Borde**: Gris claro
- **Focus**: Ring azul

### Select

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Opción 1</SelectItem>
    <SelectItem value="2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Espaciado

### Padding/Margin

```css
p-0   /* 0px */
p-1   /* 4px */
p-2   /* 8px */
p-3   /* 12px */
p-4   /* 16px */
p-6   /* 24px */
p-8   /* 32px */
p-12  /* 48px */
```

### Gap (en Flex/Grid)

```css
gap-1   /* 4px */
gap-2   /* 8px */
gap-3   /* 12px */
gap-4   /* 16px */
gap-6   /* 24px */
```

---

## Bordes

### Border Radius

```css
rounded-none   /* 0px */
rounded-sm     /* 2px */
rounded        /* 4px */
rounded-md     /* 6px */
rounded-lg     /* 8px */
rounded-xl     /* 12px */
rounded-full   /* 9999px */
```

### Border Width

```css
border       /* 1px */
border-2     /* 2px */
border-4     /* 4px */
```

---

## Sombras

```css
shadow-none   /* Sin sombra */
shadow-sm     /* Sutil */
shadow        /* Normal */
shadow-md     /* Media */
shadow-lg     /* Grande */
```

---

## Iconos (Lucide React)

### Iconos Usados

```tsx
import {
  Calendar,    // Calendario
  Users,       // Clientes
  Truck,       // Servicios/Fletes
  FileText,    // Reportes
  Plus,        // Crear
  Pencil,      // Editar
  Trash2,      // Eliminar
  Search,      // Buscar
  Filter,      // Filtrar
  FileDown,    // Descargar
  Phone,       // Teléfono
  Mail,        // Email
  MapPin,      // Ubicación
  Bell,        // Notificaciones
  User,        // Usuario
} from "lucide-react"
```

### Tamaños

```tsx
<Calendar className="h-4 w-4" />  // 16px - Pequeño
<Calendar className="h-5 w-5" />  // 20px - Normal
<Calendar className="h-6 w-6" />  // 24px - Grande
<Calendar className="h-8 w-8" />  // 32px - Extra grande
```

---

## Layout

### Sidebar

- **Ancho**: 256px (w-64)
- **Fondo**: Blanco (bg-card)
- **Borde**: Derecho, gris claro
- **Items**:
  - Padding: 12px horizontal, 8px vertical
  - Border radius: 8px (rounded-lg)
  - Hover: Fondo gris claro
  - Activo: Fondo azul, texto blanco

### Header

- **Altura**: 64px (h-16)
- **Fondo**: Blanco (bg-card)
- **Borde**: Inferior, gris claro
- **Padding**: 24px horizontal

### Main Content

- **Padding**: 24px (p-6)
- **Fondo**: Gris muy claro (bg-background)
- **Max Width**: Sin límite (usa el espacio disponible)

---

## Calendario (FullCalendar)

### Eventos

- **Padding**: 4px horizontal, 4px vertical
- **Border Radius**: 6px
- **Borde Izquierdo**: 4px, color según tipo
- **Fuente**: 14px (text-sm), medium weight

### Colores de Eventos

```css
.fc-event-flete {
  background: #ECF5FF;
  color: #5B9EF8;
  border-left: 4px solid #5B9EF8;
}

.fc-event-mudanza {
  background: #ECFDF5;
  color: #16A34A;
  border-left: 4px solid #16A34A;
}

.fc-event-escombros {
  background: #FFF4ED;
  color: #FB7A16;
  border-left: 4px solid #FB7A16;
}
```

### Botones

- **Fondo**: Azul primario
- **Texto**: Blanco
- **Hover**: Azul más oscuro
- **Border Radius**: 6px
- **Text Transform**: capitalize

---

## Responsividad

### Breakpoints

```css
sm: '640px'   /* Tablet pequeña */
md: '768px'   /* Tablet */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Desktop grande */
2xl: '1400px' /* Desktop extra grande */
```

### Ejemplos

```tsx
// Grid adaptable
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Ocultar en mobile
<div className="hidden md:block">

// Flex adaptable
<div className="flex flex-col sm:flex-row">
```

---

## Estados de UI

### Loading

```tsx
<div className="text-center py-12 text-muted-foreground">
  Cargando...
</div>
```

### Empty State

```tsx
<Card>
  <CardContent className="py-12 text-center">
    <p className="text-muted-foreground">
      No hay datos disponibles
    </p>
    <Button className="mt-4">
      Crear Primero
    </Button>
  </CardContent>
</Card>
```

### Error

```tsx
<div className="text-sm text-destructive">
  Error: No se pudo cargar los datos
</div>
```

---

## Animaciones

### Transiciones

```css
transition-colors  /* Cambios de color */
transition-shadow  /* Cambios de sombra */
transition-all     /* Todos los cambios */
```

### Duración

```css
duration-200  /* 200ms - Rápido */
duration-300  /* 300ms - Normal */
```

### Hover States

```tsx
<Card className="hover:shadow-md transition-shadow">
<Button className="hover:bg-primary/90">
```

---

## Accesibilidad

### Focus

- **Ring**: Azul, 2px
- **Offset**: 2px

```css
focus:outline-none
focus:ring-2
focus:ring-ring
focus:ring-offset-2
```

### Contraste

- Todos los colores cumplen con WCAG AA
- Texto sobre fondo claro: Usar colores 700-900
- Texto sobre fondo oscuro: Usar colores 50-200

### Labels

Siempre usar `<Label>` con inputs:

```tsx
<div className="space-y-2">
  <Label htmlFor="name">Nombre</Label>
  <Input id="name" />
</div>
```

---

## Guía Rápida de Uso

### Crear una Card de Información

```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle className="text-lg">Título</CardTitle>
        <CardDescription>
          <Badge>Etiqueta</Badge>
        </CardDescription>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-2">
    <div className="flex items-center gap-2 text-sm">
      <Phone className="h-4 w-4 text-muted-foreground" />
      <span>+56 9 1234 5678</span>
    </div>
  </CardContent>
</Card>
```

### Crear un Formulario

```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Campo *</Label>
    <Input id="field" placeholder="Ingresa..." />
    {errors && (
      <p className="text-sm text-destructive">{errors.message}</p>
    )}
  </div>

  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancelar</Button>
    <Button type="submit">Guardar</Button>
  </div>
</form>
```

---

Para más detalles sobre componentes específicos, revisa los archivos en `/components/ui/`
