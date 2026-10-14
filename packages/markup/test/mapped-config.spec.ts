import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { TSESLint } from '@typescript-eslint/utils'

import {
  MARKUPLINT_RULE_NAMES,
  languages,
  mappedRules,
} from 'eslint-plugin-markup'

const plugin = { languages, rules: mappedRules }

const allOff = Object.fromEntries(
  MARKUPLINT_RULE_NAMES.map(name => [`markup/${name}`, 'off']),
)

/** A file whose only unquoted attribute is the `class` on the `span` in it. */
const SOURCE = [
  '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head><body>',
  '<span class=foo></span>',
  '</body></html>',
].join('\n')

const lint = async (
  config: unknown,
  rules: TSESLint.FlatConfig.Rules,
  source = SOURCE,
) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'markup-config-'))
  writeFileSync(path.join(dir, '.markuplintrc'), JSON.stringify(config))
  const filename = path.join(dir, 'config.html')

  const eslint = new TSESLint.ESLint({
    baseConfig: [
      {
        files: ['**/*.html'],
        plugins: { markup: plugin },
        language: 'markup/html',
      },
      { rules: { ...allOff, ...rules } as TSESLint.FlatConfig.Rules },
    ],
    cwd: dir,
    ignore: false,
    overrideConfigFile: true,
  })

  const [result] = await eslint.lintText(source, { filePath: filename })
  return result.messages
}

test('a rule the ESLint config enables is reported', async () => {
  const messages = await lint(
    { rules: {} },
    {
      'markup/attr-value-quotes': 'error',
    },
  )

  expect(messages.map(({ ruleId }) => ruleId)).toEqual([
    'markup/attr-value-quotes',
  ])
})

test('a rule only the markuplint config enables is not reported', async () => {
  // ESLint decides which rules run: a rule enabled only in `.markuplintrc` has no ESLint rule to
  // report through, so it cannot be reported. This is the documented consequence of the model
  // rather than a silent loss, because the same rule is off in the ESLint config.
  const messages = await lint(
    { rules: { 'attr-value-quotes': true, 'no-duplicate-id': true } },
    { 'markup/attr-value-quotes': 'error' },
  )

  expect(messages.map(({ ruleId }) => ruleId)).toEqual([
    'markup/attr-value-quotes',
  ])
})

test('a rule the ESLint config turns off is not reported either', async () => {
  const messages = await lint({ rules: { 'attr-value-quotes': true } }, {})

  expect(messages).toEqual([])
})
