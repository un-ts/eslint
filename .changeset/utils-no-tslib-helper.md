---
"eslint-plugin-utils": patch
---

Stop depending on `tslib` by building without `rewriteRelativeImportExtensions`.

`loadModule` loads ESM files with a dynamic import whose specifier is only known at runtime, so TypeScript could not rewrite it at build time and instead emitted a call to its `__rewriteRelativeImportExtension` helper — imported from `tslib`, a runtime dependency this package never declared.

Relative specifiers now always name the `.js` file they compile to, which is what the emitted files referenced anyway, so `rewriteRelativeImportExtensions` is turned off in the shared `tsconfig.lib.json`. The import is emitted as written, and both the helper and the `tslib` dependency are gone from the published ESM entry.
