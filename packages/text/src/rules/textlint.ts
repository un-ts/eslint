import type { TSESLint } from '@typescript-eslint/utils'
import type { JsonMessage } from 'eslint-plugin-utils'

import { lint } from '../sync.js'

// textlint: none = 0, warning = 1, error = 2, info = 3
// eslint:   off  = 0, warn    = 1, error = 2
const SEVERITIES = [0, 1, 2, 1] as const

export const textlint: TSESLint.RuleModule<never> = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {},
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceText = context.sourceCode.text

    return {
      Program() {
        const result = lint({
          text: sourceText,
          filename: context.filename,
          linter: 'textlint',
          fix: true,
        })
        for (const { message, loc, severity, ruleId, fix } of result.messages) {
          if (severity === 0) {
            continue
          }
          const msg: JsonMessage = {
            severity: SEVERITIES[severity],
            message,
            ruleId,
          }
          context.report({
            // @ts-expect-error -- it's fine
            message: JSON.stringify(msg),
            loc,
            fix: fix && (() => fix),
          })
        }
      },
    }
  },
}
