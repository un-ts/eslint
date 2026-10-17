import rules from '@markuplint/rules'

import { MARKUPLINT_RULE_NAMES } from 'eslint-plugin-markup'

/**
 * The plugin exposes one ESLint rule per markuplint rule from a list written out by hand, because
 * there is no way to read that list synchronously while ESLint loads the plugin. This is what keeps
 * the list honest: a markuplint upgrade that adds, renames or removes a rule fails here rather than
 * leaving a rule silently missing or a stale name behind.
 */
test('the published rule names are exactly the ones markuplint ships', () => {
  const byName = (a: string, b: string) => a.localeCompare(b)
  expect([...MARKUPLINT_RULE_NAMES].toSorted(byName)).toEqual(
    Object.keys(rules).toSorted(byName),
  )
})
