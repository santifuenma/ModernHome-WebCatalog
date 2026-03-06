---
description: How to commit changes to git
---

> ⚠️ NEVER commit automatically. Only commit when the user explicitly asks for it (e.g. "haz un commit", "haz commit", "commit").

Before committing, always update README.md to reflect any changes to the project structure, dependencies, or features.

1. Review the changes made in this session (new files, modified features, dependency upgrades, etc.)
2. Update `README.md`:
   - Update the project structure tree if any files/folders were added or removed
   - Update the "Frameworks y Tecnologías Implementadas" section if dependencies changed versions
   - Update any other sections that reflect the current state of the project
3. Stage all changes:
```
git add -A
```
// turbo
4. Commit with a descriptive message following conventional commits format (feat/fix/refactor/chore/docs):
```
git commit -m "TYPE: short description"
```
5. Push to remote:
```
git push
```
