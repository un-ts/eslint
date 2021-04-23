import path from 'path'

import { ESLint } from 'eslint'

import * as ESLintPluginHtml from '@rxts/eslint-plugin-html'

const eslint = new ESLint({
  useEslintrc: false,
  plugins: {
    '@rxts/html': ESLintPluginHtml,
  },
  overrideConfig: {
    overrides: [
      {
        files: '*.html',
        parser: '@rxts/eslint-plugin-html',
        plugins: ['@rxts/html'],
        rules: {
          '@rxts/html/html': 2,
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
