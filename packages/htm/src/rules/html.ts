import { Rule } from 'eslint'
import { HTMLHint } from 'htmlhint'

export const html: Rule.RuleModule = {
  meta: {
    type: 'problem',
  },
  create(context) {
    const sourceCode = context.getSourceCode().text

    return {
      Program() {
        const results = HTMLHint.verify(sourceCode)
        for (const { evidence, message, line, col, rule } of results) {
          context.report({
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
