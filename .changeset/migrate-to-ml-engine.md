---
"eslint-plugin-markup": minor
---

Migrate the markuplint bridge from `mlTestFile()` to the public `MLEngine.fromCode()` / `exec()` API.

- `mlTestFile()` is only re-exported from markuplint's internal testing tool and is absent from its published type declarations, so it is not a supported entry point anymore.
- Preserve `ignoreExt`, which `mlTestFile()` passed implicitly: without it `exec()` resolves to `null` for files whose extension is not matched by the resolved markuplint config (including virtual file names crafted by ESLint processors) and those files would silently pass.
- Treat a `null` result as "not linted" and release every engine with `close()`, so the config file watcher and event listeners are not leaked.
