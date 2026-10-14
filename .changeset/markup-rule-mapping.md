---
"eslint-plugin-markup": minor
---

Expose markuplint's rules as individual ESLint rules, so a config can pick rules and severities itself instead of only getting the whole of markuplint at once.

- Every markuplint rule is published as `markup/<rule>` (107 of them), backed by a single markuplint pass per file shared by the enabled rules. `meta` names and `--print-config` therefore describe real rules.
- ESLint owns severity: `'markup/attr-value-quotes': 'warn'` reports a warning, `'off'` reports nothing, and `--rule` works per rule.
- `<!-- eslint-disable markup/<rule> -->` and `<!-- eslint-disable-next-line markup/<rule> -->` now work in markup files, and an unused directive is reported as unused. Directives are read from the parsed document, so the same characters inside a `<script>` tag or an attribute value are not mistaken for one.
- A file's own markuplint configuration still decides presets, named rule groups, `nodeRules` and `childNodeRules`; asking for a rule from ESLint enables it on top of that.
- The existing bridge rule `markup/markup` and `configs.flatRecommended` are unchanged, so adopting the mapped rules is opt-in.
