import { Target } from '@markuplint/file-resolver'
import { Violation } from '@markuplint/ml-config'
import { Rule } from 'eslint'
import { createSyncFn } from 'synckit'

const workerPath = require.resolve('../worker')

// call `creatSyncFn` lazily for performance, it is already cached inside, related #31
const _ = {
  get markuplintSync() {
    return createSyncFn<
      (
        target: Target,
        fix?: boolean,
      ) => Promise<{ violations: Violation[]; fixedCode: string }>
    >(workerPath)
  },
}

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
      _.markuplintSync(markuplintOptions, fix)

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
