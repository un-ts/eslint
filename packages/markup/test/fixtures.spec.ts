import path from 'node:path'

import { ESLint } from 'eslint'

const eslint = new ESLint({
  useEslintrc: false,
  ignore: false,
  overrideConfig: {
    overrides: [
      {
        files: '*.html',
        extends: 'plugin:markup/recommended',
      },
    ],
  },
})

test('fixtures', async () => {
  const results = await eslint.lintFiles(
    path.resolve(__dirname, 'fixtures/*.html'),
  )
  for (const { filePath, messages } of results) {
    expect(messages).toMatchSnapshot(path.basename(filePath))
  }
})
