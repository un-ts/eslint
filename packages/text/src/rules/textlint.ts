import { Rule } from 'eslint'

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
          context.report({
            message: JSON.stringify({ severity, message, ruleId }),
            loc,
            fix: fix && (() => fix as Rule.Fix),
          })
        }
      },
    }
  },
}
