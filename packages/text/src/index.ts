import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { Hint } from 'htmlhint/types'

export * as configs from './configs'
export * from './parser'
export * as rules from './rules'
export * from './types'

registerJsonMessageHandler(
  'text/text',
  ({ evidence, rule, message }: Hint) => ({
    ruleId: `text/${rule.id}`,
    message: `${message}
evidence: ${evidence}
reference: ${
      // istanbul ignore next
      rule.link ?? '-'
    }`,
  }),
)
