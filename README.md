# Modern Home Catalog Base

Proyecto Next.js 15+ con App Router y TypeScript, integrado con Supabase y Cloudinary. Arquitectura optimizada para catálogos de 4000+ productos con paginación real en base de datos, select mínimo por contexto e imágenes servidas en formato moderno vía Cloudinary (WebP/AVIF).

## 🗂️ Estructura del Proyecto

```text
MODERN HOME CATALOG/
├── app/                            # 🚀 App Router de Next.js (Rutas y Páginas)
│   ├── admin/                      # Panel de administración (protegido por middleware)
│   │   ├── actions.ts              # Server Actions: CRUD, visibilidad, tiendas, imágenes
│   │   ├── products/               # Gestión de productos
│   │   │   ├── [id]/page.tsx       # Edición de producto (ocultar/publicar, eliminar)
│   │   │   ├── new/                # Creación de nuevo producto
│   │   │   └── page.tsx            # Listado con filtros avanzados y paginación
│   │   ├── import/                 # Importación masiva desde Excel (por tienda)
│   │   ├── inventory/              # Comparativa de inventario y exportación a Excel
│   │   ├── deactivate/             # Eliminación masiva de productos por tienda
│   │   └── login/                  # Página de login admin
│   ├── api/                        # Rutas API de backend
│   ├── catalogo/                   # Rutas dinámicas del catálogo público
│   │   ├── [ambiente]/             # Ej: /catalogo/dormitorio → filtra por ambiente
│   │   └── [ambiente]/[subcategoria]/ # Ej: /catalogo/sala/sofas → filtra por subcategoría
│   │       └── [producto]/         # Ej: /catalogo/dormitorio/camas/dorian → detalle
│   ├── globals.css                 # Estilos globales y reset (Vanilla CSS)
│   ├── layout.tsx                  # Root Layout (Navbar y envoltorios de la app)
│   └── page.tsx                    # Página de Inicio / Home
├── components/                     # 🧩 Componentes React reutilizables
│   ├── admin/                      # Componentes del panel de administración
│   │   ├── ProductTable.tsx        # Tabla de productos con badge "Oculto"
│   │   ├── ProductFiltersBar.tsx   # Filtros avanzados (estado, imágenes, tienda, stock)
│   │   ├── ProductForm.tsx         # Formulario CRUD + selector de tiendas/stock
│   │   ├── ProductEditShell.tsx    # Layout 2 columnas del editor de producto
│   │   ├── ImageUploader.tsx       # Subida de imágenes vía Cloudinary
│   │   ├── SwatchesManager.tsx     # Gestión de muestras de material
│   │   ├── DownloadsManager.tsx    # Gestión de archivo descargable (ej: modelo 3D)
│   │   └── ExportCatalogButton.tsx # Exportación del catálogo a Excel
│   ├── catalog/                    # Componentes específicos de productos
│   │   ├── ProductDetails.tsx      # Ficha de detalle de producto
│   │   └── FiltrosWrapper.tsx      # Oculta los filtros en páginas de detalle
│   └── layout/                     # Componentes estructurales de la web
│       ├── Filtros.tsx             # Barra de filtros por ambiente/subcategoría
│       │                           # (selector de tienda desactivado temporalmente)
│       ├── Navbar.tsx              # Barra de navegación principal con selector de tienda
│       └── ProductGrid.tsx         # Cuadrícula de productos del catálogo
├── features/                       # 💡 Lógica de negocio por funcionalidad
│   ├── ambientes/                  # Feature de Ambientes
│   ├── subcategorias/              # Feature de Subcategorías
│   ├── products/                   # Feature de Productos
│   │   ├── product.repository.ts   # Acceso a DB: paginación real, filtro stock > 0
│   │   │                           # por tienda, JOIN many-to-many con product_stores
│   │   ├── product.service.ts      # Lógica de negocio: CRUD, tiendas, visibilidad
│   │   └── product.types.ts        # Tipos: Product (is_active, stores), ProductCard
│   └── inventory/                  # Feature de Inventario
│       ├── inventory.service.ts    # Importación/eliminación masiva desde Excel
│       └── export.service.ts       # Exportación del catálogo a Excel (.xlsx)
├── infrastructure/                 # 🧱 Implementaciones técnicas externas
│   ├── cloudinary/                 # Integración con Cloudinary
│   └── supabase/                   # Integración con Supabase (cliente/servidor)
├── supabase/
│   └── migrations/                 # Scripts SQL de migración (ej: product_stores.sql)
├── utils/                          # 🛠️ Utilidades
├── public/                         # 🖼️ Recursos estáticos
├── middleware.ts                   # Protección de rutas /admin con Supabase Auth
└── package.json                    # Dependencias y scripts del proyecto
```

## 🛠️ Frameworks y Tecnologías Implementadas

1. **Next.js (v16)**: Framework principal basado en React usando el **App Router**. Server Components por defecto, Server Actions para mutaciones.
2. **React (v19)**: Librería para el desarrollo de la interfaz de usuario.
3. **TypeScript (v5)**: Tipado estricto en toda la codebase.
4. **Supabase (`@supabase/ssr`)**: Base de datos y autenticación. Queries con paginación real `.range()` y COUNT separado. Relación `product_stores` many-to-many con stock por tienda.
5. **Cloudinary (`next-cloudinary`)**: Alojamiento y optimización de imágenes. URLs con `f_auto,q_auto` (WebP/AVIF automático).
6. **CSS Modules**: Estilos modulares por componente (Vanilla CSS), sin frameworks externos.

---

## 🚀 Requisitos previos
- Node.js (v18+)

## 📦 Instalación

```bash
npm install
```

## 💻 Desarrollo

Inicia el entorno de desarrollo local:

```bash
npm run dev
```

Sitio disponible en http://localhost:3000

## 🔧 Configuración y Variables de Entorno
Copia el archivo `.env.example` a `.env.local` e introduce tus credenciales:
```bash
cp .env.example .env.local
```

Variables necesarias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## ⚙️ Build
Para compilar la aplicación para producción:

```bash
npm run build
```

## 🌐 Deploy
El proyecto está optimizado y preparado para un despliegue sin configuración adicional en [Vercel](https://vercel.com).
Conecta tu repositorio en Vercel, asegúrate de proporcionar las variables de entorno, y realiza el deploy automático en cada push a tu rama principal.
