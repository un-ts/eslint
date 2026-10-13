---
"eslint-plugin-htm": patch
"eslint-plugin-markup": major
"eslint-plugin-react-enhanced": patch
"eslint-plugin-text": major
"eslint-plugin-utils": patch
---

fix(deps): update all dependencies

- `eslint-plugin-markup`: migrate to markuplint v5, which removes the `@markuplint/rule-textlint` plugin
- `eslint-plugin-text`: migrate to textlint v15 and map its `info` severity to `warn`
- adapt to `@pkgr/core` v0.3 where `EVAL_FILENAMES` is no longer exported
