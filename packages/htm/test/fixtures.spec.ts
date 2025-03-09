import path from 'node:path'

import { TSESLint } from '@typescript-eslint/utils'

import { configs } from 'eslint-plugin-htm'

const eslint = new TSESLint.ESLint({
  ignore: false,
  overrideConfig: [configs.flatRecommended],
})

test('fixtures', async () => {
  const results = await eslint.lintFiles(
    path.resolve(__dirname, './fixtures/*.html'),
  )
  for (const { filePath, messages } of results) {
    expect(messages).toMatchSnapshot(path.basename(filePath))
  }
})
