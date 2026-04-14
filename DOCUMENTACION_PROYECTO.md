# Modern Home Catalog - Documentación del Proyecto

## 1. Propósito y Funcionalidad Actual
El proyecto **Modern Home Catalog** fue creado para servir como un catálogo digital de alto rendimiento enfocado en la presentación y exhibición de mobiliario y decoración para el hogar. Su objetivo principal fue el de procesar y renderizar más de 4000 productos garantizando velocidad y fluidez.

**Función Actual:** 
Hoy en día funciona como una robusta plataforma de uso dual:
1. **Público / Clientes:** Un catálogo responsivo categorizado por "Ambiente" (ej: dormitorio, sala) y "Subcategoría" (ej: camas, sillones), con un diseño atractivo que prioriza que solo se muestren en la plataforma pública los productos "activos y que cuentan con imágenes".
2. **Administrativo / Backend:** Integra un poderoso sistema de **Multi-Tienda e Inventario** ("Multi-Store Inventory System"). El equipo administrador puede realizar actualizaciones masivas de disponibilidad en diferentes locales (ej. sucursal "Las Mercedes") subiendo planillas de Excel, buscar códigos de productos rápidamente, asignar nuevas texturas (*swatches*)/fotos (sin duplicar assets almacenados), exportar listas de revisión y realizar altas o bajas masivas. 

## 2. Tecnologías Principales
- **Framework Core:** Next.js (Versión 16+) utilizando *App Router* y React 19.
- **Lenguaje:** TypeScript (v5).
- **Base de Datos & Auth:** Supabase (PostgreSQL) manejando los usuarios administradores. Además, procesa la paginación a nivel infraestructura de BDD (para no sobrecargar la capa de red).
- **Gestos de Imágenes:** Cloudinary, automatizando transformaciones con `next-cloudinary` para servir archivos optimizados en formatos `WebP` o `AVIF`.
- **Diseño & Estilos:** Módulos de CSS estandarizados (Vanilla CSS con `module.css`), lo que aporta escopado local para todas las clases construidas, manteniendo una estructura sumamente limpia.

## 3. Estructura del Proyecto

El código fuente sigue los dogmas propuestos para el mantenimiento escalable (Screaming Architecture por Casos de Uso/Features):

- **/app**: Rutas y Front-End.
  - **/app/(catalog)**: Las vitrinas públicas del cliente (`/catalogo/`, `/catalogo/[ambiente]`, y la ficha del producto individual).
  - **/app/admin**: Dasboard interno fuertemente protegido. Posee formularios de ingesta, de actualización de multimedia, de asignación de stores y subida masiva Excel.
- **/components**: Unidades funcionales e interactivas de React. 
  - Subdividido lógicamente, por ejemplo: `/components/catalog` (para fichas de ítems individuales) y `/components/layout` (para componentes macro estructurales como Navbar y la barra global de Filtros).
- **/features**: El cerebro de la aplicación.
  - Separado por Dominio: `products`, `ambientes`, `subcategorias` e `inventory`. Contienen y exportan los "Repositorios" (la comunicación cruda con Supabase), "Servicios" (donde ocurre la validación lógica) y los archivos de validación de tipado (Tipos estrictos).
- **/infrastructure**: Puentes de integración externa.
  - Interfaces estandarizadas y configuraciones para instanciar el cliente de `supabase` (tanto *server* como *browser* client) y servicios referidos a `cloudinary`.
- **/scripts**: Scripts Node en crudo útiles para correr como utilidades desde la terminal (ej: `import_products.ts`, `update_store.ts`). Muchos cimentaron las bases de las operaciones que hoy suceden gráficamente.
- **/supabase**: Aquí viven las migraciones de PostgreSQL en lenguaje DDL (`.sql`).

## 4. Endpoints, APIs y Acciones del Servidor

Por diseño de arquitectura Next App Router moderno, el proyecto rara vez crea Endpoints REST tradicionales en base al esquema `/api`. En cambio utiliza **Server Actions**, centralizadas principalment en `app/admin/actions.ts`. Estas son las responsables de gestionar la seguridad transaccional:

### A. Gestión de Catálogo Base
- `saveProduct(formData)`: Insert (alta) o update de la metadata global de producto, detectando y cruzando asignación de tiendas conectadas (`store_code`).
- `removeProduct(id)`: Eliminación en la BBDD.

### B. Gestión de Medios Auxiliares
- `attachImage` / `detachImage`: Asignan "Public ID"s de Cloudinary a códigos de inventario específicos en Supabase.
- `attachSwatch` / `detachSwatch`: Similar, especial para variantes de materiales o colores de tela.
- `attachDownload` / `detachDownload`: Capataces de links de recursos útiles extra.

### C. Sistema CRUD de Tiendas e Inventario (Excel-Based)
Alimentados por validaciones cruzadas ubicadas en `features/inventory/inventory.service.ts`:
- `importProductsAction(formData)`: Procesa un Buffer de servidor importando filas de "Excel" y vinculándolas a la entidad en Supabase de una tienda dada.
- `removeFromStoreAction(formData)` /  `deactivateProductsAction`: Desactiva productos en *batch* de tiendas concretas sin borrar el producto en sí de la base datos.
- `compareInventoryAction(formData)`: Muestra al administrador diferencias lógicas ("Deltas") entre un archivo en formato planilla y el inventario real de una tienda, previo a ser ejecutado.
- `exportCatalogAction`: Genera un base64 del catálogo puro desde Supabase, en formato de archivo descargable excel.
