import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { TSESLint } from '@typescript-eslint/utils'
import { MLEngine } from 'markuplint'

import {
  MARKUPLINT_RULE_NAMES,
  languages,
  mappedRules,
} from 'eslint-plugin-markup'

/**
 * The rules both runs agree to check. markuplint's own resolution also enables rules from its
 * presets, so ESLint turns every rule off first and then enables exactly these.
 */
const ENABLED = {
  'require-doctype': true,
  'no-duplicate-id': true,
  'attr-value-quotes': true,
  'require-accessible-name': true,
  'attr-order': true,
}

const SOURCE = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head><body>
<div id="a">x</div>
<div id="a">x</div>
<img src="y.png" >
<span class=foo></span>
</body></html>`

const plugin = { languages, rules: mappedRules }

const eslintConfig = {
  files: ['**/*.html'],
  plugins: { markup: plugin },
  language: 'markup/html',
}

const lintWithPlugin = async (
  filename: string,
  enabled: Record<string, boolean> = ENABLED,
) => {
  const rules = Object.fromEntries([
    ...MARKUPLINT_RULE_NAMES.map(name => [`markup/${name}`, 'off']),
    ...Object.keys(enabled).map(name => [`markup/${name}`, 'error']),
  ]) as TSESLint.FlatConfig.Rules
  const eslint = new TSESLint.ESLint({
    baseConfig: [eslintConfig, { rules }],
    // the fixture lives in a temporary directory, which has to be the working directory or ESLint
    // ignores it as being outside its base path
    cwd: path.dirname(filename),
    ignore: false,
    overrideConfigFile: true,
  })
  const [result] = await eslint.lintText(SOURCE, { filePath: filename })
  return result.messages
    .filter(({ ruleId }) => ruleId?.startsWith('markup/'))
    .map(({ ruleId, line, column }) => `${ruleId}@${line}:${column}`)
}

const lintWithEngine = async (filename: string) => {
  const engine = await MLEngine.fromCode(SOURCE, { name: filename })
  const result = await engine.exec()
  await engine.close()
  return (result?.violations ?? []).map(
    ({ ruleId, line, col }) => `markup/${ruleId}@${line}:${col}`,
  )
}

/** Violations are compared as sorted strings, one per report. */
const sorted = (violations: string[]) =>
  violations.toSorted((a, b) => a.localeCompare(b))

/**
 * Writes a configuration and returns the file a run should be checked against.
 *
 * @param config - the markuplint configuration to place in the directory
 * @returns the markup file inside it
 */
const fixture = (config: unknown) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'markup-parity-'))
  writeFileSync(path.join(dir, '.markuplintrc'), JSON.stringify(config))
  return path.join(dir, 'parity.html')
}

test('reports exactly what markuplint reports for the same file', async () => {
  const filename = fixture({ rules: ENABLED })

  const [fromPlugin, fromEngine] = await Promise.all([
    lintWithPlugin(filename),
    lintWithEngine(filename),
  ])

  // both runs see the same file and the same configuration, so the violations must match one for
  // one, including markuplint's own repeated reports for rules that several named groups contain
  expect(fromPlugin).not.toEqual([])
  expect(sorted(fromPlugin)).toEqual(sorted(fromEngine))
})

test('keeps node-level rule configuration working', async () => {
  // the attribute rule is on everywhere except inside `span`: if the merged ruleset dropped the
  // file's own node rules, the plugin would report the span that markuplint does not
  const filename = fixture({
    rules: { 'attr-value-quotes': true },
    nodeRules: [{ selector: 'span', rules: { 'attr-value-quotes': false } }],
  })

  const enabled = { 'attr-value-quotes': true }
  const [fromPlugin, fromEngine] = await Promise.all([
    lintWithPlugin(filename, enabled),
    lintWithEngine(filename),
  ])

  // the only unquoted attribute value is inside a `span`, so both runs are expected to be empty:
  // a ruleset that dropped the file's node rules would report it and fail the comparison
  expect(fromEngine).toEqual([])
  expect(sorted(fromPlugin)).toEqual(sorted(fromEngine))
})
