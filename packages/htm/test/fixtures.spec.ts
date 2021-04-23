import path from 'path'

import { ESLint } from 'eslint'

import * as ESLintPluginHtm from 'eslint-plugin-htm'

const eslint = new ESLint({
  useEslintrc: false,
  plugins: {
    htm: ESLintPluginHtm,
  },
  overrideConfig: {
    overrides: [
      {
        files: '*.html',
        parser: 'eslint-plugin-htm',
        plugins: ['htm'],
        rules: {
          'htm/html': 2,
        },
      },
    ],
  },
})

test('fixtures', async () => {
  const results = await eslint.lintFiles(
    path.resolve(__dirname, './fixtures/*.html'),
  )
  for (const { filePath, messages } of results) {
    expect(messages).toMatchSnapshot(path.basename(filePath))
  }
})
