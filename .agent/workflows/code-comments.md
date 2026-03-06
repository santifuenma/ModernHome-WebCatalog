---
description: How to comment code when adding or modifying it
---

Every time new code is added or modified, add clear comments following these rules:

## TypeScript / TSX files

Add a block comment at the top of every new function, hook, or component explaining:
- What it does (purpose)
- Why it exists (reason/context)
- Key parameters if non-obvious

```ts
/**
 * getProductBySlug
 * Busca un producto en los datos mock por su slug único.
 * Se usa en la página de detalle para cargar el producto correcto según la URL.
 */
export function getProductBySlug(slug: string): Product | undefined {
    ...
}
```

For inline logic that isn't immediately obvious, add a short inline comment:
```ts
// Filter out the currently selected image so it doesn't appear in thumbnails
const thumbnails = images.filter(img => img.url !== selectedImage)
```

## CSS / CSS Modules files

Group related rules with a section comment:
```css
/* ─── MAIN IMAGE ───────────────────────────────────────── */
.mainImageContainer { ... }
.mainImageWrapper { ... }

/* ─── THUMBNAILS ────────────────────────────────────────── */
.thumbnailsContainer { ... }
```

Add a short comment above any non-obvious rule explaining why it exists:
```css
/* position: relative needed so the ::after overlay stays inside the card */
.thumbnailWrapper {
    position: relative;
}
```

## General rules
- Comments must be in the same language as the rest of the file's comments (Spanish or English, keep it consistent per file)
- Do NOT comment obvious things like `// set width to 100%`
- Keep comments short: 1-2 lines max unless the logic is truly complex
