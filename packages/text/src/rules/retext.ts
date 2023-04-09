import { Rule } from 'eslint'
import { JsonMessage } from 'eslint-plugin-utils'

import { lint } from '../sync.js'

export const retext: Rule.RuleModule = {
  meta: {
    type: 'problem',
    fixable: 'code',
  },
  create(context) {
    const sourceText = context.getSourceCode().text

    return {
      Program(node) {
        const { messages, content: fixedText } = lint({
          text: sourceText,
          filename: context.getFilename(),
          linter: 'retext',
        })
        let fixed = 0

        for (const {
          reason,
          ruleId,
          fatal,
          line,
          column,
          position,
        } of messages) {
          const { start, end } = position!

          // https://github.com/remarkjs/remark-lint/issues/65#issuecomment-220800231
          /* istanbul ignore next */
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
          context.report({
            // related to https://github.com/eslint/eslint/issues/14198
            message: JSON.stringify(message),
            loc: {
              line: line!,
              // ! eslint ast column is 0-indexed, but unified is 1-indexed
              column: column! - 1,
              start: {
                ...start,
                column: start.column - 1,
              },
              end: {
                ...end,
                column: end.column - 1,
              },
            },
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
