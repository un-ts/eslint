import path from 'node:path'

import { ESLint } from 'eslint'

const eslint = new ESLint({
  useEslintrc: false,
  ignore: false,
  overrideConfig: {
    overrides: [
      {
        files: '*.{md,txt}',
        extends: 'plugin:text/recommended',
      },
    ],
  },
})

test('fixtures', async () => {
  const results = await eslint.lintFiles(
    path.resolve(__dirname, './fixtures/*.{md,txt}'),
  )
  for (const { filePath, messages, output, source } of results) {
    const filename = path.basename(filePath)
    expect(messages).toMatchSnapshot(filename)
    expect(output || source).toMatchSnapshot(filename)
  }
})
