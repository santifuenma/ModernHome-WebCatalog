# Modern Home Catalog Base

Proyecto Next.js 15+ con App Router y TypeScript, integrado con Supabase y Cloudinary. Arquitectura optimizada para catálogos de 4000+ productos con paginación real en base de datos, select mínimo por contexto e imágenes servidas en formato moderno vía Cloudinary (WebP/AVIF).

## 🗂️ Estructura del Proyecto

El proyecto sigue una arquitectura orientada a componentes y rutas (App Router), dividida lógicamente de la siguiente manera:

```text
MODERN HOME CATALOG/
├── app/                            # 🚀 App Router de Next.js (Rutas y Páginas)
│   ├── api/                        # Rutas API de backend
│   │   └── README.md               # Documentación sobre arquitectura de la API
│   ├── catalogo/                   # Rutas dinámicas del catálogo
│   │   ├── [ambiente]/             # Ej: /catalogo/dormitorio → filtra por ambiente
│   │   └── [ambiente]/[subcategoria]/ # Ej: /catalogo/sala/sofas → filtra por subcategoría
│   │       └── [producto]/         # Ej: /catalogo/dormitorio/camas/dorian → detalle de producto
│   ├── test-cloudinary/            # Ruta de prueba de integración con Cloudinary
│   ├── test-supabase/              # Ruta de prueba de integración con Supabase
│   ├── globals.css                 # Estilos globales y reset (Vanilla CSS)
│   ├── layout.tsx                  # Root Layout (Navbar y envoltorios de la app)
│   └── page.tsx                    # Página de Inicio / Home
├── components/                     # 🧩 Componentes React reutilizables
│   ├── catalog/                    # Componentes específicos de productos
│   │   ├── ProductDetails.tsx      # Componente de la ficha de detalle de producto
│   │   └── ProductDetails.module.css # Estilos modulares de ProductDetails
│   └── layout/                     # Componentes estructurales de la web
│       ├── Filtros.tsx             # Barra de filtros por ambiente/subcategoría (responsive)
│       ├── Filtros.module.css      # Estilos de la barra de filtros
│       ├── FiltrosWrapper.tsx      # Oculta los filtros en páginas de detalle
│       ├── Navbar.tsx              # Barra de navegación principal
│       ├── ProductGrid.tsx         # Cuadrícula de productos del catálogo
│       └── ProductGrid.module.css  # Estilos modulares para la cuadrícula
├── features/                       # 💡 Lógica de negocio por funcionalidad
│   ├── ambientes/                  # Feature de Ambientes
│   │   ├── mockAmbientes.ts        # Datos de muestra (sala, comedor, dormitorio...)
│   │   ├── ambiente.repository.ts  # Acceso a datos (pendiente Supabase)
│   │   ├── ambiente.service.ts     # getAmbientes() para la barra de filtros
│   │   └── ambiente.types.ts       # Interfaz Ambiente { label, slug }
│   ├── subcategorias/              # Feature de Subcategorías
│   │   ├── mockSubcategorias.ts    # Datos de muestra agrupados por ambiente
│   │   ├── subcategoria.repository.ts # Acceso a datos (pendiente Supabase)
│   │   ├── subcategoria.service.ts # getSubcategoriasByAmbiente()
│   │   └── subcategoria.types.ts   # Interfaz Subcategoria { label, slug, ambiente }
│   └── products/                   # Feature de Productos
│       ├── product.repository.ts   # Acceso a DB: paginación real, select mínimo, JOIN con product_stores (many-to-many)
│       ├── product.service.ts      # Lógica de negocio — delega paginación a la DB, expone setProductStores
│       └── product.types.ts        # Tipos: Product (stores: StoreCode[]), ProductCard, StoreCode, STORE_LABELS
├── infrastructure/                 # 🧱 Implementaciones técnicas externas
│   ├── cloudinary/                 # Integración con Cloudinary
│   └── supabase/                   # Integración con Supabase (cliente/servidor)
├── supabase/
│   └── migrations/                 # Scripts SQL de migración (ej: product_stores.sql)
├── utils/                          # 🛠️ Utilidades (Errores, Validadores, Respuestas)
├── public/                         # 🖼️ Recursos estáticos (Accesibles públicamente)
│   └── icons/                      # Logos e imágenes del catálogo y la app
├── styles/                         # (Opcional) Otros estilos globales
├── types/                          # Definición de tipos globales para TypeScript
├── .env.local                      # Variables de entorno locales (NO subir a Git)
├── .npmrc                          # Configuración de npm (legacy-peer-deps para Vercel)
├── middleware.ts                   # Middleware de Next.js (ej. proteger rutas)
└── package.json                    # Dependencias y scripts del proyecto
```

## 🛠️ Frameworks y Tecnologías Implementadas

1. **Next.js (v16)**: Framework principal basado en React usando el **App Router**. Optimizado para Server Components por defecto. Rutas de ambiente pre-generadas con `generateStaticParams`.
2. **React (v19)**: Librería para el desarrollo de la interfaz de usuario.
3. **TypeScript (v5)**: Tipado estricto para un desarrollo más robusto y evitar errores en tiempo de ejecución.
4. **Supabase (`@supabase/ssr`)**: Backend para base de datos y autenticación. Las queries usan paginación real con `.range()` y COUNT por separado para no transferir datos innecesarios.
5. **Cloudinary (`next-cloudinary`)**: Alojamiento, transformación y optimización de imágenes. URLs generadas con `f_auto,q_auto` (WebP/AVIF automático) y `c_limit,w_800` para cards de catálogo.
6. **CSS Modules**: Sistema de estilos basado en Vanilla CSS, permitiendo que el CSS sea modular (`.module.css`) y evitando conflictos de clases entre componentes.

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
