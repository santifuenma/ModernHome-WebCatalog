# Modern Home Catalog Base

Proyecto base Next.js 14+ con App Router y TypeScript, preparado para integración con Supabase y Cloudinary. Estructura limpia sin librerías de UI instaladas, listo para crecer y desplegar en Vercel.

## Requisitos previos
- Node.js (v18+)

## Instalación

```bash
npm install
```

## Desarrollo

Inicia el entorno de desarrollo local:

```bash
npm run dev
```

Sitio disponible en http://localhost:3000

## Configuración y Variables de Entorno
Copia el archivo `.env.example` a `.env.local` e introduce tus credenciales:
```bash
cp .env.example .env.local
```

Variables necesarias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## Build
Para compilar la aplicación para producción:

```bash
npm run build
```

## Deploy
El proyecto está optimizado y preparado para un despliegue sin configuración adicional en [Vercel](https://vercel.com).
Conecta tu repositorio en Vercel, asegúrate de proporcionar las variables de entorno, y realiza el deploy automático en cada push a tu rama principal.
