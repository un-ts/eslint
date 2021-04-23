import path from 'path'

import { ESLint } from 'eslint'

import * as ESLintPluginMarkup from 'eslint-plugin-markup'

const eslint = new ESLint({
  useEslintrc: false,
  plugins: {
    markup: ESLintPluginMarkup,
  },
  overrideConfig: {
    overrides: [
      {
        files: '*.html',
        parser: 'eslint-plugin-markup',
        plugins: ['markup'],
        rules: {
          'markup/markup': 2,
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
