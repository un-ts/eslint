---
"eslint-plugin-markup": minor
---

Publish HTML as a language plugin, so `language: 'markup/html'` can be used instead of the stub parser.

- `languages.html` is a `Language` built on `@eslint/plugin-kit`, with `markup/html` as its name in a flat config.
- `configs.flatLanguage` and `configs.flatRecommendedLanguage` mirror `flatBase` and `flatRecommended` while selecting the language; the existing `parser` and `flatRecommended` keep working unchanged, including `languageOptions.parser`.
- `markup/markup` reports from the language's `Document` node as well as from `Program`, so the same rule serves both trees; only one of the two exists per file.
