import path from 'node:path'

import { TSESLint } from '@typescript-eslint/utils'

import {
  configs,
  languages,
  mappedRules,
  MARKUPLINT_RULE_NAMES,
} from 'eslint-plugin-markup'

const plugin = { languages, rules: mappedRules }

const eslint = (rules: TSESLint.FlatConfig.Rules) =>
  new TSESLint.ESLint({
    baseConfig: [
      {
        files: ['**/*.html'],
        plugins: { markup: plugin },
        language: 'markup/html',
      },
      { rules },
    ],
    ignore: false,
    overrideConfigFile: true,
  })

const filename = path.resolve(import.meta.dirname, 'fixtures/mapped.html')

/** Markup whose only violation is an unquoted attribute value, on line 2. */
const unquoted = [
  '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head><body>',
  '<span class=foo></span>',
  '</body></html>',
].join('\n')

const lint = async (code: string, rules: TSESLint.FlatConfig.Rules) => {
  const [result] = await eslint(rules).lintText(code, { filePath: filename })
  return result.messages
}

test('exposes every markuplint rule under the plugin namespace', () => {
  expect(Object.keys(mappedRules)).toContain('attr-value-quotes')
  expect(Object.keys(mappedRules)).toHaveLength(MARKUPLINT_RULE_NAMES.length)
})

test('reports a violation under the markuplint rule id', async () => {
  const messages = await lint(unquoted, {
    'markup/attr-value-quotes': 'error',
  })

  expect(messages).toHaveLength(1)
  expect(messages[0]).toMatchObject({
    ruleId: 'markup/attr-value-quotes',
    line: 2,
    severity: 2,
  })
  expect(messages[0].message).toContain('quote')
})

test('lets ESLint own the severity', async () => {
  const warn = await lint(unquoted, {
    'markup/attr-value-quotes': 'warn',
  })
  expect(warn).toHaveLength(1)
  expect(warn[0].severity).toBe(1)

  expect(await lint(unquoted, { 'markup/attr-value-quotes': 'off' })).toEqual(
    [],
  )
})

test('runs only the rules that are enabled', async () => {
  const messages = await lint(unquoted, {
    'markup/attr-value-quotes': 'error',
    'markup/require-doctype': 'error',
  })

  // the file has a doctype, so only the attribute rule reports
  expect(messages.map(({ ruleId }) => ruleId)).toEqual([
    'markup/attr-value-quotes',
  ])
})

test('honors a file-scoped directive naming the rule', async () => {
  const messages = await lint(
    `<!-- eslint-disable markup/attr-value-quotes -->\n${unquoted}`,
    { 'markup/attr-value-quotes': 'error' },
  )

  expect(messages).toEqual([])
})

test('honors a line-scoped directive naming the rule', async () => {
  const messages = await lint(
    [
      '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head><body>',
      '<!-- eslint-disable-next-line markup/attr-value-quotes -->',
      '<span class=foo></span>',
      '</body></html>',
    ].join('\n'),
    { 'markup/attr-value-quotes': 'error' },
  )

  expect(messages).toEqual([])
})

test('does not let a directive for another rule suppress it', async () => {
  const messages = await lint(
    `<!-- eslint-disable markup/no-duplicate-id -->\n${unquoted}`,
    // both rules are enabled and both report, so the directive has a rule to match that is not the
    // one it must not silence
    { 'markup/attr-value-quotes': 'error', 'markup/no-duplicate-id': 'error' },
  )

  expect(
    messages
      .filter(({ severity }) => severity === 2)
      .map(({ ruleId }) => ruleId),
  ).toEqual(['markup/attr-value-quotes'])
})

test('reports an unused directive', async () => {
  const [result] = await eslint({
    'markup/attr-value-quotes': 'error',
  }).lintText(
    `<!-- eslint-disable markup/attr-value-quotes -->\n<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head><body></body></html>`,
    { filePath: filename },
  )

  expect(result.messages.map(({ message }) => message)).toEqual([
    expect.stringContaining('Unused eslint-disable directive'),
  ])
})

test('keeps the language configs working for the mapped rules', () => {
  expect(configs.flatLanguage.language).toBe('markup/html')
})
