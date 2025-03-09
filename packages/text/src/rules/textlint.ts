import type { TSESLint } from '@typescript-eslint/utils'
import type { JsonMessage } from 'eslint-plugin-utils'

import { lint } from '../sync.js'

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
        })
        for (const { message, loc, severity, ruleId, fix } of result.messages) {
          if (severity === 0) {
            continue
          }
          const msg: JsonMessage = { severity, message, ruleId }
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
