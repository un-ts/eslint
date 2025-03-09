import type { TSESLint } from '@typescript-eslint/utils'
import type { JsonMessage } from 'eslint-plugin-utils'

import { lint } from '../sync.js'

export const retext: TSESLint.RuleModule<never> = {
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
      Program(node) {
        const { messages, content: fixedText } = lint({
          text: sourceText,
          filename: context.filename,
          linter: 'retext',
          fix: true,
        })
        let fixed = 0

        for (const { reason, ruleId, fatal, line, column, place } of messages) {
          // https://github.com/remarkjs/remark-lint/issues/65#issuecomment-220800231
          /* istanbul ignore next */
          // eslint-disable-next-line sonarjs/no-nested-conditional
          const severity = fatal ? 2 : fatal == null ? 0 : 1
          /* istanbul ignore if */
          if (!severity) {
            // should never happen, just for robustness
            continue
          }

          const message: JsonMessage = {
            message: reason,
            ruleId: ruleId!,
            severity,
          }

          const pos = place && 'start' in place ? place : undefined

          context.report({
            // @ts-expect-error -- it's fine
            // related to https://github.com/eslint/eslint/issues/14198
            message: JSON.stringify(message),
            // ! eslint ast column is 0-indexed, but unified is 1-indexed
            loc: pos
              ? {
                  start: { ...pos.start, column: pos.start.column - 1 },
                  end: { ...pos.end, column: pos.end.column - 1 },
                }
              : { line: line!, column: column! - 1 },
            node,
            fix:
              fixedText === sourceText
                ? null
                : () =>
                    fixed++
                      ? null
                      : {
                          range: [0, sourceText.length],
                          text: fixedText,
                        },
          })
        }
      },
    }
  },
}
