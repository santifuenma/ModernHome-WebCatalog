# Modern Home Catalog Base

Proyecto base Next.js 14+ con App Router y TypeScript, preparado para integración con Supabase y Cloudinary. Estructura limpia sin librerías de UI instaladas, listo para crecer y desplegar en Vercel.

## 🗂️ Estructura del Proyecto

El proyecto sigue una arquitectura orientada a componentes y rutas (App Router), dividida lógicamente de la siguiente manera:

```text
MODERN HOME CATALOG/
├── app/                            # 🚀 App Router de Next.js (Rutas y Páginas)
│   ├── api/                        # Rutas API de backend
│   │   └── README.md               # Documentación sobre arquitectura de la API
│   ├── catalogo/                   # Rutas dinámicas del catálogo
│   │   └── [ambiente]/[subcategoria]/[producto]/ # Ej: /catalogo/dormitorio/camas/dorian
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
│       ├── FiltrosWrapper.tsx      # Barra/Filtros de navegación secundaria
│       ├── Navbar.tsx              # Barra de navegación principal
│       ├── ProductGrid.tsx         # Cuadrícula de productos de muestra
│       └── ProductGrid.module.css  # Estilos modulares para la cuadrícula
├── domain/                         # 🧠 Dominio del sistema
│   ├── entities/                   # Entidades principales (modelos de datos puros)
│   └── types/                      # Tipos compartidos del dominio
├── services/                       # ⚙️ Lógica de aplicación (Casos de uso)
├── repositories/                   # 🗄️ Capa de abstracción de base de datos
├── infrastructure/                 # 🧱 Implementaciones técnicas externas
│   ├── cloudinary/                 # Integración con Cloudinary
│   └── supabase/                   # Integración con Supabase (cliente/servidor)
├── utils/                          # 🛠️ Utilidades (Errores, Validadores, Respuestas)
├── lib/                            # 🛠️ Helpers y configuraciones legacy
│   └── supabase/                   # Configuración del cliente Supabase SSR
├── public/                         # 🖼️ Recursos estáticos (Accesibles públicamente)
│   └── icons/                      # Logos e imágenes del catálogo y la app
├── styles/                         # (Opcional) Otros estilos globales
├── types/                          # Definición de tipos globales para TypeScript
├── .env.local                      # Variables de entorno locales (NO subir a Git)
├── middleware.ts                   # Middleware de Next.js (ej. proteger rutas)
└── package.json                    # Dependencias y scripts del proyecto
```

## 🛠️ Frameworks y Tecnologías Implementadas

1. **Next.js (v14.2.15)**: Framework principal basado en React usando el **App Router**. Optimizado para Server Components por defecto.
2. **React (v18)**: Librería para el desarrollo de la interfaz de usuario.
3. **TypeScript (v5)**: Tipado estricto para un desarrollo más robusto y evitar errores en tiempo de ejecución.
4. **Supabase (`@supabase/ssr`)**: Implementado como backend para base de datos y autenticación, preparado para funcionar de forma segura desde el servidor.
5. **Cloudinary (`next-cloudinary`)**: Integración lista para el alojamiento, transformación y optimización de imágenes.
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
