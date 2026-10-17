# eslint-plugin-utils

## 0.4.3

### Patch Changes

- [#155](https://github.com/un-ts/eslint/pull/155) [`693dfdc`](https://github.com/un-ts/eslint/commit/693dfdc9d3c360b014f7c5d2ea2576dba03b5e76) Thanks [@JounQin](https://github.com/JounQin)! - Stop depending on `tslib` by building without `rewriteRelativeImportExtensions`.

  `loadModule` loads ESM files with a dynamic import whose specifier is only known at runtime, so TypeScript could not rewrite it at build time and instead emitted a call to its `__rewriteRelativeImportExtension` helper — imported from `tslib`, a runtime dependency this package never declared.

  Relative specifiers now always name the `.js` file they compile to, which is what the emitted files referenced anyway, so `rewriteRelativeImportExtensions` is turned off in the shared `tsconfig.lib.json`. The import is emitted as written, and both the helper and the `tslib` dependency are gone from the published ESM entry.

## 0.4.2

### Patch Changes

- [#141](https://github.com/un-ts/eslint/pull/141) [`d153069`](https://github.com/un-ts/eslint/commit/d153069c9f9c1c968dc2c4dbb011b66f0360fd8b) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update all dependencies

  - `eslint-plugin-htm`: require Node.js `>=18` (from `htmlhint`)
  - `eslint-plugin-markup`: migrate to markuplint v5, which removes the `@markuplint/rule-textlint` plugin, and require Node.js `>=24`
  - `eslint-plugin-text`: migrate to textlint v15, require Node.js `>=20.18.0`, and map its `info` severity to `warn`
  - adapt to `@pkgr/core` v0.3 where `EVAL_FILENAMES` is no longer exported

## 0.4.1

### Patch Changes

- [#137](https://github.com/un-ts/eslint/pull/137) [`c8ffdb0`](https://github.com/un-ts/eslint/commit/c8ffdb04b0992c9d3f7389dab22b14feb7ef8ab5) Thanks [@JounQin](https://github.com/JounQin)! - fix: compatible with older ESLint versions

## 0.4.0

### Minor Changes

- [#133](https://github.com/un-ts/eslint/pull/133) [`dfabbde`](https://github.com/un-ts/eslint/commit/dfabbde34a58838d85c9b376ebd318447f6dba10) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump and add flat config support

## 0.3.2

### Patch Changes

- [#83](https://github.com/un-ts/eslint/pull/83) [`6c0420c`](https://github.com/un-ts/eslint/commit/6c0420c3512a601bcccace564197ba07b8648b7b) Thanks [@JounQin](https://github.com/JounQin)! - docs: incorrect README content

## 0.3.1

### Patch Changes

- [#73](https://github.com/un-ts/eslint/pull/73) [`3516221`](https://github.com/un-ts/eslint/commit/3516221792f305a99cea28f0d2c81cce3adfba23) Thanks [@JounQin](https://github.com/JounQin)! - - chore: migrate to unts org
  - chore: add donate field, bump deps

## 0.3.0

### Minor Changes

- [`2616f9d`](https://github.com/un-ts/eslint/commit/2616f9dbf3fc81935f987907e56fa5af3f9266d3) Thanks [@JounQin](https://github.com/JounQin)! - chore(deps)!: bump all (dev)Dependencies, use exports field

## 0.2.0

### Minor Changes

- [`a2c68dd`](https://github.com/un-ts/eslint/commit/a2c68dd7ac4ff9b67b0cb1f371a008cf359dae19) Thanks [@JounQin](https://github.com/JounQin)! - feat: update entry files extensions

## 0.1.0

### Minor Changes

- [#22](https://github.com/un-ts/eslint/pull/22) [`2270c8b`](https://github.com/un-ts/eslint/commit/2270c8b0049725eb59bbc0cc45e9655b6162d735) Thanks [@JounQin](https://github.com/JounQin)! - feat: report correct ruleId from original linter
