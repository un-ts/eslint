import type { TSESLint } from '@typescript-eslint/utils'
import { HTMLHint } from 'htmlhint'

export const html: TSESLint.RuleModule<never> = {
  meta: {
    type: 'problem',
    messages: {},
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceText = context.sourceCode.text

    return {
      Program() {
        const results = HTMLHint.verify(sourceText)
        for (const { evidence, message, line, col, rule } of results) {
          context.report({
            // @ts-expect-error -- it's fine
            message: JSON.stringify({ evidence, message, rule }),
            loc: {
              line,
              // ! eslint ast column is 0-indexed, but htmlhint is 1-indexed
              column: col - 1,
            },
          })
        }
      },
    }
  },
}
