import path from 'node:path'

import { TSESLint } from '@typescript-eslint/utils'

import { configs, HTML_LANGUAGE_NAME, languages } from 'eslint-plugin-markup'

const eslint = new TSESLint.ESLint({
  baseConfig: [configs.flatRecommendedLanguage],
  ignore: false,
  overrideConfigFile: true,
})

const filename = path.resolve(import.meta.dirname, 'fixtures/language.html')

const lint = async (code: string) => {
  const [result] = await eslint.lintText(code, { filePath: filename })
  return result.messages
}

test('exposes the markup language under the html name', () => {
  expect(Object.keys(languages)).toEqual([HTML_LANGUAGE_NAME])
})

test('lints through the language instead of a stub parser', async () => {
  const [result] = await eslint.lintText(
    '<html><head></head><body></body></html>',
    { filePath: filename },
  )

  expect(result.messages).toEqual([
    expect.objectContaining({
      ruleId: 'markup/require-doctype',
      line: 1,
      column: 1,
    }),
  ])
})

test('reports once even when a config enables both parsers', async () => {
  const confused = new TSESLint.ESLint({
    baseConfig: [
      configs.flatRecommended,
      configs.flatLanguage,
      { rules: { 'markup/markup': 1 } },
    ],
    ignore: false,
    overrideConfigFile: true,
  })

  const [result] = await confused.lintText(
    '<html><head></head><body></body></html>',
    { filePath: filename },
  )

  expect(result.messages).toHaveLength(1)
})

test('traverses a Document node, not a Program one', async () => {
  const visited: string[] = []
  const probe = new TSESLint.ESLint({
    baseConfig: [
      configs.flatLanguage,
      {
        plugins: {
          probe: {
            rules: {
              seen: {
                meta: { schema: [], messages: {} },
                create: () => ({
                  Document: () => {
                    visited.push('Document')
                  },
                  Program: () => {
                    visited.push('Program')
                  },
                }),
              },
            },
          },
        },
        rules: { 'probe/seen': 1 },
      },
    ],
    ignore: false,
    overrideConfigFile: true,
  })

  await probe.lintText('<p>hi</p>', { filePath: filename })

  expect(visited).toEqual(['Document'])
})

test('accepts valid markup through the language', async () => {
  expect(
    await lint(/* HTML */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Any Page</title>
        </head>
        <body>
          <h1>Any Page</h1>
        </body>
      </html>
    `),
  ).toEqual([])
})

describe('inline directives in HTML comments', () => {
  const invalid = '<html><head></head><body></body></html>'

  test('suppresses everything the named rule reports', async () => {
    const messages = await lint(
      `<!-- eslint-disable markup/markup -->\n${invalid}`,
    )

    expect(messages.filter(({ ruleId }) => ruleId === 'markup/markup')).toEqual(
      [],
    )
  })

  test('leaves a rule the comment does not name alone', async () => {
    const messages = await lint(
      `<!-- eslint-disable markup/something-else -->\n${invalid}`,
    )

    expect(messages.map(({ ruleId }) => ruleId)).toContain(
      'markup/require-doctype',
    )
  })

  test('ignores the same characters inside a script tag', async () => {
    const messages = await lint(
      `<script>const s = "<!-- eslint-disable markup/markup -->"</script>\n${invalid}`,
    )

    expect(messages.map(({ ruleId }) => ruleId)).toContain(
      'markup/require-doctype',
    )
  })

  test('reports an unused directive', async () => {
    const reporting = new TSESLint.ESLint({
      baseConfig: [
        configs.flatRecommendedLanguage,
        { linterOptions: { reportUnusedDisableDirectives: 'error' } },
      ],
      ignore: false,
      overrideConfigFile: true,
    })

    const [result] = await reporting.lintText(
      `<!-- eslint-disable markup/markup -->\n<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>t</title></head><body></body></html>`,
      { filePath: filename },
    )

    expect(result.messages.map(({ message }) => message)).toEqual([
      expect.stringContaining(
        "Unused eslint-disable directive (no problems were reported from 'markup/markup')",
      ),
    ])
  })
})
