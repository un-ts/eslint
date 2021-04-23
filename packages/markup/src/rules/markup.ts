import { Rule } from 'eslint'
import { exec } from 'markuplint'

export const markup: Rule.RuleModule = {
  meta: {
    fixable: 'code',
    type: 'problem',
  },
  create(context) {
    const filename = context.getFilename()
    const sourceCode = context.getSourceCode().text

    return {
      // eslint-disable-next-line sonar/function-name
      async Program() {
        const resultInfos = await exec({
          sourceCodes: sourceCode,
          names: filename,
          fix: true,
        })

        for (const resultInfo of resultInfos) {
          let index = 0
          for (const result of resultInfo.results) {
            context.report({
              message: result.message,
              loc: {
                line: result.line,
                column: result.col,
              },
              fix() {
                return index++
                  ? null
                  : {
                      range: [0, sourceCode.length - 1],
                      text: resultInfo.fixedCode,
                    }
              },
            })
          }
        }
      },
    }
  },
}
