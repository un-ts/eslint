import type { TSESLint } from '@typescript-eslint/utils'

import { sync } from '../sync.js'

export const markup: TSESLint.RuleModule<never> = {
  meta: {
    fixable: 'code',
    type: 'problem',
    messages: {},
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename
    const sourceText = context.sourceCode.text

    const markuplintOptions = {
      sourceCode: sourceText,
      name: filename,
    }

    const runMarkuplint = (fix?: boolean) =>
      sync.markuplintSync(markuplintOptions, fix)

    return {
      Program() {
        const { violations } = runMarkuplint()

        if (violations.length === 0) {
          return
        }

        let fixed = 0

        for (const { ruleId, severity, message, line, col } of violations) {
          context.report({
            // @ts-expect-error -- it's fine
            message: JSON.stringify({ severity, message, ruleId }),
            loc: {
              line,
              // ! eslint ast column is 0-indexed, but markuplint is 1-indexed
              column: col - 1,
            },
            fix() {
              if (fixed++) {
                return null
              }
              const { fixedCode } = runMarkuplint(true)
              return sourceText === fixedCode
                ? null
                : {
                    range: [0, sourceText.length],
                    text: fixedCode,
                  }
            },
          })
        }
      },
    }
  },
}
