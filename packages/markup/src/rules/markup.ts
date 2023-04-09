import { Rule } from 'eslint'

import { sync } from '../sync.js'

export const markup: Rule.RuleModule = {
  meta: {
    fixable: 'code',
    type: 'problem',
  },
  create(context) {
    const filename = context.getFilename()
    const sourceText = context.getSourceCode().text

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
