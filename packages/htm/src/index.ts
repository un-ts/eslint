import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { LintResult } from 'htmlhint'

export * from './parser'
export * as configs from './configs'
export * as rules from './rules'

registerJsonMessageHandler(
  'htm/html',
  ({ evidence, rule, message }: LintResult) => ({
    ruleId: `htm/${rule.id}`,
    message: `${message}
evidence: ${evidence}
reference: ${rule.link}`,
  }),
)
