import { Rule } from 'eslint'
import { exec } from 'markuplint'
import { createSyncFn } from 'synckit'

import { getPhysicalFilename, resolveConfig } from '../helpers'

const execSync = createSyncFn<typeof exec>(require.resolve('../worker'))

export const markup: Rule.RuleModule = {
  meta: {
    fixable: 'code',
    type: 'problem',
  },
  create(context) {
    const filename = context.getFilename()
    const { text } = context.getSourceCode()
    return {
      // eslint-disable-next-line sonar/function-name
      Program() {
        const runMarkuplint = (fix?: boolean) =>
          execSync({
            sourceCodes: text,
            names: filename,
            config: resolveConfig(getPhysicalFilename(filename)),
            fix,
          })

        let fixed = 0

        const resultInfos = runMarkuplint()

        if (resultInfos.length === 0) {
          return
        }

        for (const { message, line, col } of resultInfos[0].results) {
          context.report({
            message,
            loc: {
              line,
              column: col,
            },
            fix() {
              if (fixed++) {
                return null
              }
              const { fixedCode } = runMarkuplint(true)[0]
              return text === fixedCode
                ? null
                : {
                    range: [0, text.length],
                    text: fixedCode,
                  }
            },
          })
        }
      },
    }
  },
}
