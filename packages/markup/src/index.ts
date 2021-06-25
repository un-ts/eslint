import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { VerifiedResult } from '@markuplint/ml-config'
import { Linter } from 'eslint'

export * from './helpers'
export * from './parser'
export * from './rules'
export * as configs from './configs'
export * as rules from './rules'

const SEVERITIES = ['info', 'warning', 'error'] as const

registerJsonMessageHandler(
  'markup/markup',
  (
    { ruleId, severity, message }: VerifiedResult,
    { severity: eslintSeverity },
  ) => ({
    ruleId: `markup/${ruleId}`,
    message,
    severity: Math.max(
      eslintSeverity,
      SEVERITIES.indexOf(severity),
    ) as Linter.Severity,
  }),
)
