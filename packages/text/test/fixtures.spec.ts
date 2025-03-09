import path from 'node:path'

import { TSESLint } from '@typescript-eslint/utils'

import { configs } from 'eslint-plugin-text'

const eslint = new TSESLint.ESLint({
  ignore: false,
  overrideConfig: [configs.flatRecommended],
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
