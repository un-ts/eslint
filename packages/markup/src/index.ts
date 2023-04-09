import { Violation } from '@markuplint/ml-config'
import { Linter } from 'eslint'
import { registerJsonMessageHandler } from 'eslint-plugin-utils'

export * as configs from './configs.js'
export * from './parser.js'
export * from './rules/index.js'
export * as rules from './rules/index.js'

const SEVERITIES = ['info', 'warning', 'error'] as const

registerJsonMessageHandler(
  'markup/markup',
  ({ ruleId, severity, message }: Violation, { severity: eslintSeverity }) => ({
    ruleId: `markup/${ruleId}`,
    message,
    severity: Math.max(
      eslintSeverity,
      SEVERITIES.indexOf(severity),
    ) as Linter.Severity,
  }),
)
