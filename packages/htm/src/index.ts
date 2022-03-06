import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { Hint } from 'htmlhint/types'

export * as configs from './configs'
export * from './parser'
export * as rules from './rules'

registerJsonMessageHandler('htm/html', ({ evidence, rule, message }: Hint) => ({
  ruleId: `htm/${rule.id}`,
  message: `${message}
evidence: ${evidence}
reference: ${rule.link ?? '-'}`,
}))
