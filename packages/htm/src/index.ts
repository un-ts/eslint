import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { Hint } from 'htmlhint/types.js'

export * as configs from './configs.js'
export * from './parser.js'
export * as rules from './rules/index.js'

registerJsonMessageHandler('htm/html', ({ evidence, rule, message }: Hint) => ({
  ruleId: `htm/${rule.id}`,
  message: `${message}
evidence: ${evidence}
reference: ${
    // istanbul ignore next
    rule.link ?? '-'
  }`,
}))
