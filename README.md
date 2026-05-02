# Modern Home Catalog

Plataforma de catálogo digital multi-tienda construida con Next.js 16, App Router y TypeScript, integrada con Supabase y Cloudinary. Arquitectura optimizada para 4000+ productos con paginación real en base de datos, select mínimo por contexto e imágenes servidas en formato moderno (WebP/AVIF).

## 🗂️ Estructura del Proyecto

```text
MODERN HOME CATALOG/
├── app/                            # 🚀 App Router de Next.js (Rutas y Páginas)
│   ├── (catalog)/                  # Grupo de rutas del catálogo público
│   │   ├── layout.tsx              # Layout: Navbar + barra de filtros
│   │   ├── page.tsx                # Home (redirige a /catalogo)
│   │   └── catalogo/               # Rutas dinámicas del catálogo público
│   │       ├── page.tsx            # /catalogo — todos los productos
│   │       ├── [ambiente]/         # /catalogo/sala — filtrado por ambiente
│   │       │   ├── page.tsx
│   │       │   └── [subcategoria]/ # /catalogo/sala/sofas — filtrado por subcategoría
│   │       │       ├── page.tsx
│   │       │       └── [producto]/ # /catalogo/sala/sofas/dorian — ficha de detalle
│   └── admin/                      # Panel de administración (protegido por middleware)
│       ├── actions.ts              # Server Actions: CRUD, visibilidad, tiendas, imágenes
│       ├── layout.tsx              # Layout admin con barra superior y logout
│       ├── page.tsx                # Dashboard admin con filtros avanzados
│       ├── products/               # Gestión de productos
│       │   ├── [id]/page.tsx       # Edición de producto (ocultar/publicar, eliminar)
│       │   └── new/page.tsx        # Creación de nuevo producto
│       ├── import/                 # Importación masiva desde Excel (por tienda)
│       ├── inventory/              # Comparativa de inventario y exportación a Excel
│       ├── deactivate/             # Baja masiva de productos por tienda
│       └── login/                  # Página de login admin
├── components/                     # 🧩 Componentes React reutilizables
│   ├── admin/                      # Componentes del panel de administración
│   │   ├── ProductTable.tsx        # Tabla de productos con badge "Oculto"
│   │   ├── ProductFiltersBar.tsx   # Filtros avanzados (estado, imágenes, tienda, stock)
│   │   ├── ProductForm.tsx         # Formulario CRUD + selector de tiendas/stock
│   │   ├── ProductEditShell.tsx    # Layout 2 columnas del editor de producto
│   │   ├── ImageUploader.tsx       # Subida de imágenes vía Cloudinary
│   │   ├── SwatchesManager.tsx     # Gestión de muestras de material
│   │   ├── DownloadsManager.tsx    # Gestión de archivo descargable (ej: ficha técnica)
│   │   └── ExportCatalogButton.tsx # Exportación del catálogo a Excel
│   ├── catalog/                    # Componentes del catálogo público
│   │   ├── ProductGrid.tsx         # Cuadrícula de productos
│   │   ├── ProductDetails.tsx      # Ficha de detalle de producto
│   │   ├── Filtros.tsx             # Barra de filtros ambiente/subcategoría
│   │   └── FiltrosWrapper.tsx      # Oculta filtros en páginas de detalle
│   ├── layout/                     # Componentes estructurales
│   │   └── Navbar.tsx              # Barra de navegación principal
│   └── ui/                         # Componentes UI genéricos (Pagination, etc.)
├── features/                       # 💡 Lógica de negocio por dominio
│   ├── ambientes/                  # Feature de Ambientes
│   ├── subcategorias/              # Feature de Subcategorías
│   ├── products/                   # Feature de Productos
│   │   ├── product.repository.ts   # Acceso a DB: paginación real, JOIN product_stores
│   │   ├── product.service.ts      # Lógica de negocio: CRUD, tiendas, visibilidad
│   │   └── product.types.ts        # Tipos: Product, ProductCard, StoreCode
│   └── inventory/                  # Feature de Inventario
│       ├── inventory.service.ts    # Importación/eliminación masiva desde Excel
│       └── export.service.ts       # Exportación del catálogo a Excel (.xlsx)
├── infrastructure/                 # 🧱 Clientes de servicios externos
│   ├── cloudinary/                 # Integración con Cloudinary
│   └── supabase/                   # Clientes Supabase (server, browser, middleware)
├── database/                       # 🗃️ Schema SQL y datos de seed
│   ├── schema.sql                  # Definición completa de tablas
│   └── seed.sql                    # Datos iniciales de ejemplo
├── supabase/
│   └── migrations/                 # Migraciones SQL aplicadas
├── scripts/                        # 🛠️ Scripts CLI de utilidad (Node/tsx)
│   ├── import_products.ts          # Importación masiva desde Excel
│   ├── sync_hobang_dimensions.ts   # Sincronización de dimensiones/materiales vía JSON
│   └── update_store.ts             # Actualización masiva de asignaciones de tienda
├── public/                         # 🖼️ Recursos estáticos (logos, iconos)
├── middleware.ts                   # Protección de rutas /admin con Supabase Auth
├── next.config.mjs                 # Configuración Next.js (CSP, imágenes, caché)
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
