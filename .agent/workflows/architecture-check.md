---
description: How to ensure architectural coherence before implementing anything new
---

Before writing any new code, always review the existing project architecture to ensure the new code fits coherently. Follow these steps:

## 1. Read the project structure

Check `README.md` for the current folder structure and understand how the project is organized.

## 2. Identify the correct layer for the new code

Use the following decision tree:

| What are you adding? | Where does it go? |
|---|---|
| A page or route | `app/` |
| A reusable UI component | `components/` |
| Business logic, data fetching, types for a domain concept | `features/[concept]/` |
| External client setup (Supabase, Cloudinary) | `infrastructure/` |
| Shared helpers (error handling, validators, formatters) | `utils/` |
| Global types not tied to one feature | `types/` |

## 3. Check if the feature folder already exists

Before creating anything, check if a `features/[concept]/` folder already exists. If it does, extend it with new files following the same naming pattern:
- `[concept].types.ts`
- `mock[Concept]s.ts`
- `[concept].repository.ts`
- `[concept].service.ts`

## 4. Never hardcode domain data in UI components

Data like lists of ambientes, subcategorías, brands, etc. must live in `features/[concept]/mock[Concept].ts` and be exposed via a service function. UI components call the service — they never own the data.

## 5. Write the service first, then the UI

Always create/update the feature service before touching the component. Components are consumers of features, not the other way around.

## Example of what NOT to do

❌ Hardcoding a list of ambientes directly inside `Filtros.tsx`:
```ts
const AMBIENTES = [{ label: 'Sala', slug: 'sala' }, ...]
```

✅ Correct approach:
```ts
// features/ambientes/ambiente.service.ts
export function getAmbientes(): Ambiente[] { return mockAmbientes }

// Filtros.tsx
import { getAmbientes } from '@/features/ambientes/ambiente.service'
const ambientes = getAmbientes()
```
