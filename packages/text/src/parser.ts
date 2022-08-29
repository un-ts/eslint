import { Linter } from 'eslint'

export interface TextParserOptions extends Linter.ParserOptions {
  filePath?: string
}

export const parseForESLint = (
  text: string,
  _options?: TextParserOptions,
): Linter.ESLintParseResult => {
  const lines = text.split('\n')
  return {
    ast: {
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
          column: lines[lines.length - 1].length,
        },
      },
    },
  }
}

/* istanbul ignore next */
export const parse = (text: string, options?: TextParserOptions) =>
  parseForESLint(text, options).ast
