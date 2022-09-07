import { Rule } from 'eslint'
import { JsonMessage } from 'eslint-plugin-utils'

import { lint } from '../sync'

export const textlint: Rule.RuleModule = {
  meta: {
    type: 'problem',
    fixable: 'code',
  },
  create(context) {
    const sourceText = context.getSourceCode().text

    return {
      Program() {
        const result = lint({
          text: sourceText,
          filename: context.getFilename(),
          linter: 'textlint',
        })
        for (const { message, loc, severity, ruleId, fix } of result.messages) {
          if (severity === 0) {
            continue
          }
          const msg: JsonMessage = { severity, message, ruleId }
          context.report({
            message: JSON.stringify(msg),
            loc,
            fix: fix && (() => fix as Rule.Fix),
          })
        }
      },
    }
  },
}
