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
        for (const result of results) {
          context.report({
            message: result.message,
            loc: {
              line: result.line,
              column: result.col,
            },
          })
        }
      },
    }
  },
}
