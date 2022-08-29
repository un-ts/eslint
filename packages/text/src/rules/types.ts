import { Linter } from 'eslint'

export interface RetextLintMessage {
  reason: string
  source: string | null
  ruleId: string | null
  severity: Linter.Severity
}
