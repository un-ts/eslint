import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { version } from './meta.js'

export const meta = {
  name: 'htm-eslint',
  version,
}

export interface HtmlParserOptions extends TSESLint.Linter.ParserOptions {
  filePath?: string
}

export const parseForESLint = (
  text: string,
  _options?: HtmlParserOptions,
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
  options?: HtmlParserOptions,
): TSESTree.Program => parseForESLint(text, options).ast
