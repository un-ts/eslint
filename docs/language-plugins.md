# Adapters and language plugins: markuplint and stylelint

> **Short version:** adopt ESLint's language plugin API for the _language host_, not for the
> _rule model_. `eslint-plugin-markup`, `eslint-plugin-htm` and `eslint-plugin-text` all
> implement the same "bridge an external linter into ESLint" pattern, and the language plugin API
> replaces the three pieces that pattern needs (`parser` stub + `processor` + JSON-encoded
> messages) with a real `Language` and `SourceCode`. It does **not** turn markuplint or stylelint
> rules into ESLint rules, and it should not try to.

This document records the reasoning and the constraints that were verified against the versions
this repository actually depends on: ESLint `10.12.0`, markuplint `5.1.1`, stylelint `17.16.0`,
`@eslint/plugin-kit` `0.7.3`.

## 1. The pattern we already have

| Package                | Parsing                                    | Rules                                                         | Message channel                                  | Fix        |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| `eslint-plugin-markup` | `src/parser.ts` returns an empty `Program` | one `markup/markup` rule calls `MLEngine` in a synckit worker | `JSON.stringify` + `utils/jsonMessage` processor | whole file |
| `eslint-plugin-htm`    | same stub parser                           | one `htm/html` rule calls `HTMLHint.verify`                   | same processor                                   | none       |
| `eslint-plugin-text`   | same stub parser                           | `text/retext` and `text/textlint` call a synckit worker       | same processor                                   | whole file |
| `eslint-plugin-utils`  | -                                          | -                                                             | `jsonMessageHandlers` registry + processor       | -          |

All of it exists because of one restriction in ESLint: **`context.report()` requires a
`messageId` that was declared in `meta.messages` ahead of time.** An external linter decides its
rule ids at runtime, so the only way to surface them is to encode the message as JSON and decode
it in a processor's `postprocess`.

What that costs today:

- flat config has to carry `languageOptions.parser` (a stub) _and_ a `processor` _and_ one
  catch-all rule;
- a rule only ever visits `Program`, so reports can carry `{ line, column }` but no node;
- `--fix-type`, `--rule`, suppression and inline disable comments degrade accordingly;
- the reported `markup/<markuplint-rule>` id does not exist in ESLint, so `--print-config`,
  `meta.docs` and suppressions cannot describe it.

## 2. Verified constraints

These were checked in this checkout, not assumed.

1. **Language plugins are the supported extension point** (ESLint `>= 9.7`). A plugin declares
   `languages: { <name>: <Language> }` and a flat config selects it with
   `language: "<plugin-namespace>/<name>"`
   (see `node_modules/eslint/lib/config/config.js`, which resolves the language out of the
   registered plugins; the built-in JavaScript language is registered as `@/js`).
2. **`Language.parse()` must be synchronous.** `node_modules/eslint/lib/services/parser-service.js`
   throws `Unsupported: Language parser returned a promise.` when `parse()` returns a thenable.
   markuplint and stylelint are asynchronous, so the synckit worker cannot be removed by this
   migration - it can only be moved.
3. **`SourceCode` has a small hard requirement.** `ast`, `text`, `getLoc()`, `getRange()` and
   `traverse()` are required; `visitorKeys`, `applyLanguageOptions()`, `getInlineConfigNodes()`,
   `applyInlineConfig()`, `getDisableDirectives()` and `finalize()` are optional.
   `@eslint/plugin-kit`'s `TextSourceCodeBase` implements everything except `traverse()` and
   `getParent()`, and its `getLoc()` / `getRange()` already understand ESTree-style `loc` /
   `range`, so a language only has to supply traversal.
4. **Do not put a language in `eslint-plugin-utils`.** ESLint resolves a language name through a
   plugin namespace, so `utils/css` would collide with every other `utils` plugin in the
   ecosystem. A language belongs to the plugin that owns the language.
5. **markuplint v5** exposes `MLEngine.fromCode(source, options)` and `engine.exec()`. The parsed
   document (`engine.document`) is a real DOM tree: `nodeList`, `nodeType`, `childNodes`,
   `parentNode`, and tokens carrying `startOffset` / `startLine` / `startCol` (1-based).
6. **stylelint 17 is ESM-only** (`exports["."].default` is `./lib/index.mjs`) while these packages
   also ship CommonJS, so it has to be loaded from inside the worker (the existing
   `loadModule()` helper in `eslint-plugin-utils` already does this).
7. **postcss nodes have no `range`**, but `node.source.start.offset` / `end.offset` are always
   available, which makes synthesizing `range` cheap. This is what makes a CSS language plugin
   practical.
8. **A file has exactly one language.** `language` is a single flat-config key, so a `.vue` or
   `.html` file cannot be linted as markup _and_ as CSS at the language level. Embedded styles
   have to go through a processor with virtual file names.

## 3. `eslint-plugin-markup`: bounded migration

### 3.1 Recommended shape

```js
// eslint.config.js
import markup from 'eslint-plugin-markup'

export default [
  {
    files: ['**/*.html'],
    plugins: { markup },
    language: 'markup/html',
    rules: { 'markup/markup': 1 },
  },
]
```

- `languages.html` describes HTML: `fileType: 'text'`, `lineStart: 1`, `columnStart: 0`,
  `nodeTypeKey: 'type'`, and a `visitorKeys` map for the node types the language emits.
- The rule keeps running markuplint through the existing worker and reports violations. It is
  still one bridge rule: markuplint hands back `violations`, not node events, so there are no
  per-node reports to make.
- Because the language owns traversal, the same rule is reachable from two trees. The bridge
  registers a visitor for the language's root node (`Document`) and keeps `Program` for the
  legacy stub-parser path. Only one of the two exists per file, so nothing is reported twice.

### 3.2 What this actually buys

- the stub parser and the JSON-message processor stop being load-bearing;
- configuration becomes canonical (`language` instead of `parser`, which matters because
  `@1stg/eslint-config` also assigns `languageOptions.parser` to `.html` for Angular templates);
- a `SourceCode` with a real traversal is the prerequisite for node-based reporting and for
  honoring `<!-- eslint-disable -->`-style directives in markup files later.

### 3.3 Costs and risks

- **`parse()` stays thin and synchronous.** Building the full markuplint document inside
  `parse()` would require the async engine and would parse every file twice. The realistic
  long-term split is: parse cheaply and synchronously for structure, and let the bridge rule run
  the engine.
- **An AST adapter is real work.** markuplint's nodes are class instances with getters rather
  than plain objects, and their columns are 1-based while ESLint columns are 0-based.
- **Tests need care.** `@typescript-eslint/rule-tester`'s `ValidTestCase` type only accepts
  `languageOptions.parser`; it has no `language` field, and its runner forces the TypeScript
  parser onto `languageOptions.parser`. A language-based config therefore has to be exercised
  through the `ESLint` class, the way `packages/markup/test/fixtures.spec.ts` already does.
- **Consumers have to be migrated in step.** `@1stg/eslint-config` extends
  `markup.configs.flatRecommended` from `overrides.js`, `vue.js` and `angular.js`. Keeping
  `parser` and `flatRecommended` exported unchanged makes this an additive minor; flipping
  `flatRecommended` onto the language is a major.

### 3.4 Not recommended: markuplint rules as ESLint rules

Exposing `markup/no-empty-element` and friends as real ESLint rules with real `messageId`s and
node locations means rebuilding markuplint's rule dispatch (`RuleInfo`, `document.currentRule`)
and replacing its selector engine with esquery. markuplint rules are written against markuplint's
own CSS-like selectors, and `matchesSelectorClass()` cannot paper over the difference, so the
result would be two ASTs and two configuration systems to maintain. The payoff - per-rule
`--fix-type` precision and node-level disable comments - does not cover that cost.

## 4. `eslint-plugin-style` and stylelint

### 4.1 Recommended shape

```js
// eslint.config.js
import style from 'eslint-plugin-style'

export default [
  {
    files: ['**/*.css'],
    plugins: { style },
    language: 'style/css',
    rules: {
      'style/stylelint': 1, // bridge, same reasoning as markup
      'style/order': 1, // native rules written against the postcss AST
    },
  },
]
```

- `languages.css` uses postcss as the parser: `nodeTypeKey: 'type'` (postcss uses `root`, `rule`,
  `decl`, `atrule`, `comment`), `lineStart: 1`, `columnStart: 0` (postcss columns are 1-based and
  need the same `- 1` treatment as markuplint's), and `visitorKeys` mapping the container types to
  `['nodes']`.
- `parse()` calls `postcss.parse(text, { from, offset: true })`, which is synchronous and can
  return `{ ok: false, errors }` for malformed CSS. **That is the biggest single win over the
  processor approach:** a CSS syntax error becomes a non-fatal parse problem instead of taking
  down the lint of the file.
- `createSourceCode()` synthesizes `range` from `source.start.offset` / `end.offset` and builds on
  `TextSourceCodeBase`.
- `style/stylelint` loads stylelint inside the worker (`await import('stylelint')`), maps
  `warnings[]` (`rule`, `text`, `line`, `column`, `endLine`, `endColumn`, `severity`) to
  `context.report()` calls, and uses `result.output` for a whole-file fix.

### 4.2 Two dead ends

1. **Do not use a processor to represent CSS.** A processor's `preprocess()` returns strings that
   ESLint then parses _as JavaScript_, which is exactly the stub-parser pattern from section 1.
   A processor has one legitimate use here: extracting embedded CSS out of a host file.
2. **Do not put the language and the rules in one package and call it done.** If
   `eslint-plugin-style` is both the CSS language and the stylelint bridge, then any package that
   wants to reuse CSS (markup, mdx, vue) has to depend on the whole style plugin. The language is
   better off in its own package (for example `@unts/language-css`), with
   `eslint-plugin-style` holding rules and presets.

### 4.3 Embedded CSS

Because `language` is a single key, `<style>` blocks and `.vue`/`.astro` styles need a processor
plus virtual file names:

```js
;[
  {
    files: ['**/*.vue', '**/*.html'],
    plugins: { style },
    processor: 'style/embeddedCss', // preprocess -> Foo.vue/0_style.css
  },
  {
    files: ['**/*.css', '**/*.vue/*.css'], // virtual names must match too
    language: 'style/css',
    rules: { 'style/stylelint': 1 },
  },
]
```

The processor needs `supportsAutofix: true`, and a fix inside a `<style>` block has to be mapped
back into the host file rather than replacing the virtual file wholesale. That mapping deserves
its own design and its own PR.

### 4.4 Relationship to `eslint-plugin-css`

`@1stg/eslint-config` already uses `eslint-plugin-css`, which covers CSS awareness plus a set of
native CSS rules. `eslint-plugin-style` should therefore stay narrow:

- bridge the stylelint ecosystem (reusing the user's `.stylelintrc`, stylelint plugins and
  shared configs) - the part `eslint-plugin-css` cannot do;
- add a small number of native rules on top of the postcss AST;
- not re-implement what `eslint-plugin-css` already covers.

Otherwise users face two CSS plugins and two recommended configurations, and the tradeoff costs
more than it returns.

## 5. Rollout

0. **Done - `eslint-plugin-markup` runs on the public engine (minor).**
   `src/worker.ts` moved from `mlTestFile()` to `MLEngine.fromCode()` + `exec()`, with
   `ignoreExt: true` preserved (without it, `exec()` returns `null` for files whose extension is
   unmatched by the resolved markuplint config and they pass silently) and `close()` in a
   `finally`. Covered by a `fixtures/basic.xyz` regression case.
1. **`eslint-plugin-markup` gains `languages.html` + `configs.flatLanguage` (minor, additive).**
   `parser` and `flatRecommended` keep working exactly as before.
2. **`@unts/language-css` (new, internal).** postcss parse + `TextSourceCodeBase` + `traverse()`
   and `visitorKeys`, accepted through tests that use the `ESLint` class against `.css` files and
   that do not import stylelint.
3. **`eslint-plugin-style` 0.x.** The `style/stylelint` bridge (dynamic `import()` of stylelint 17
   inside the worker) plus `flat/recommended`. Embedded `<style>` support follows separately,
   with the virtual-filename fix mapping designed first.
4. **`eslint-plugin-markup` major.** `flatRecommended` switches to `language` and the processor
   dependency goes away; `@1stg/eslint-config` follows. `htm` and `text` can be migrated the same
   way - `htm` has no fixes at all, so it is the least valuable and can go last.

Acceptance criteria for every step: `.html`, `.pug` and `.vue` files lint through the `ESLint`
class, `--fix` is idempotent, and both the `language` and the legacy `languageOptions.parser`
configurations work during the transition.
