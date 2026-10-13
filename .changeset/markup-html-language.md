---
"eslint-plugin-markup": minor
---

Publish HTML as a language plugin, so `language: 'markup/html'` can be used instead of the stub parser.

- `languages.html` is a `Language` built on `@eslint/plugin-kit`, exposed as `markup/html`. Its syntax tree is the one markuplint's HTML parser produces, so ESLint measures real markup instead of a synthetic root.
- `configs.flatLanguage` and `configs.flatRecommendedLanguage` mirror `flatBase` and `flatRecommended` while selecting the language; the existing `parser` and `flatRecommended` keep working unchanged, including `languageOptions.parser`.
- `markup/markup` reports from the language's `Document` node as well as from `Program`, so the same rule serves both trees; only one of the two exists per file.
- `<!-- eslint-disable markup/markup -->` now works in markup files, and an unused directive is reported as unused. The comments come from the parsed document, so the same characters inside a `<script>` tag or an attribute value are not mistaken for a directive.
