import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { version } from './meta.js'

export const meta = {
  name: 'text-eslint',
  version,
}

export interface TextParserOptions extends TSESLint.Linter.ParserOptions {
  filePath?: string
}

export const parseForESLint = (
  text: string,
  _options?: TextParserOptions,
): TSESLint.Parser.ParseResult => {
  const lines = text.split('\n')
  return {
    ast: {
      // @ts-expect-error -- bad ts enum
      type: 'Program',
      sourceType: 'module',
      comments: [],
      tokens: [],
      body: [],
      range: [0, text.length],
      loc: {
        start: {
          line: 1,
          column: 0,
        },
        end: {
          line: lines.length,
          column: lines.at(-1)?.length ?? 0,
        },
      },
    },
  }
}

/* istanbul ignore next */
export const parse = (
  text: string,
  options?: TextParserOptions,
): TSESTree.Program => parseForESLint(text, options).ast
