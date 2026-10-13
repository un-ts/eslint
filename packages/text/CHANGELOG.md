# eslint-plugin-text

## 2.0.0

### Major Changes

- [#141](https://github.com/un-ts/eslint/pull/141) [`d153069`](https://github.com/un-ts/eslint/commit/d153069c9f9c1c968dc2c4dbb011b66f0360fd8b) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update all dependencies

  - `eslint-plugin-htm`: require Node.js `>=18` (from `htmlhint`)
  - `eslint-plugin-markup`: migrate to markuplint v5, which removes the `@markuplint/rule-textlint` plugin, and require Node.js `>=24`
  - `eslint-plugin-text`: migrate to textlint v15, require Node.js `>=20.18.0`, and map its `info` severity to `warn`
  - adapt to `@pkgr/core` v0.3 where `EVAL_FILENAMES` is no longer exported

## 1.0.1

### Patch Changes

- [#137](https://github.com/un-ts/eslint/pull/137) [`c8ffdb0`](https://github.com/un-ts/eslint/commit/c8ffdb04b0992c9d3f7389dab22b14feb7ef8ab5) Thanks [@JounQin](https://github.com/JounQin)! - fix: compatible with older ESLint versions

## 1.0.0

### Major Changes

- [#133](https://github.com/un-ts/eslint/pull/133) [`dfabbde`](https://github.com/un-ts/eslint/commit/dfabbde34a58838d85c9b376ebd318447f6dba10) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump and add flat config support

### Patch Changes

- Updated dependencies [[`dfabbde`](https://github.com/un-ts/eslint/commit/dfabbde34a58838d85c9b376ebd318447f6dba10)]:
  - eslint-plugin-utils@0.4.0

## 0.2.0

### Minor Changes

- [#103](https://github.com/un-ts/eslint/pull/103) [`b151c64`](https://github.com/un-ts/eslint/commit/b151c6461fff0c9d40f14e3d66beaadd341acc09) Thanks [@JounQin](https://github.com/JounQin)! - feat!: migrate to markuplint v3, use `type: module`

## 0.1.3

### Patch Changes

- [#90](https://github.com/un-ts/eslint/pull/90) [`a6dc873`](https://github.com/un-ts/eslint/commit/a6dc87305320a0e2c5aaee97a154be0c0b227346) Thanks [@JounQin](https://github.com/JounQin)! - feat: load textlint config automatically

- [#88](https://github.com/un-ts/eslint/pull/88) [`2a999ec`](https://github.com/un-ts/eslint/commit/2a999ec34054937e0aa3a389ecd830942d2653eb) Thanks [@JounQin](https://github.com/JounQin)! - fix: incorrect vfile usage for retext rule

## 0.1.2

### Patch Changes

- [`0ca3d2a`](https://github.com/un-ts/eslint/commit/0ca3d2a9ede1cc86fb8618de3209b30f7055fe36) Thanks [@JounQin](https://github.com/JounQin)! - fix: register text rules correctly

## 0.1.1

### Patch Changes

- [#83](https://github.com/un-ts/eslint/pull/83) [`6c0420c`](https://github.com/un-ts/eslint/commit/6c0420c3512a601bcccace564197ba07b8648b7b) Thanks [@JounQin](https://github.com/JounQin)! - docs: incorrect README content

## 0.1.0

### Minor Changes

- [#81](https://github.com/un-ts/eslint/pull/81) [`818c278`](https://github.com/un-ts/eslint/commit/818c278ab656525dafc07dabaf4e62898f3e6e5f) Thanks [@JounQin](https://github.com/JounQin)! - feat: first blood, should just work
