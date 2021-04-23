import { Rule } from 'eslint'

export const markup: Rule.RuleModule = {
  meta: {
    fixable: 'code',
    type: 'problem',
  },
  create() {
    return {
      // eslint-disable-next-line sonar/function-name
      Program() {
        // no sync API available temporarily
      },
    }
  },
}
