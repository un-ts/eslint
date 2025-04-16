import type { Violation } from '@markuplint/ml-config'
import type { TSESLint } from '@typescript-eslint/utils'
import { jsonMessage, registerJsonMessageHandler } from 'eslint-plugin-utils'

import * as configs_ from './configs.js'
import * as meta from './meta.js'
import * as parser from './parser.js'
import * as rules from './rules/index.js'

const markup: TSESLint.Linter.Plugin = { meta, rules }

const flatBase: TSESLint.FlatConfig.Config = {
  name: 'markup/flat-base',
  files: ['**/*.html'],
  plugins: { markup },
  processor: jsonMessage,
  languageOptions: { parser },
}

const flatRecommended: TSESLint.FlatConfig.Config = {
  ...flatBase,
  name: 'markup/flat-recommended',
  rules: configs_.recommended.rules,
}

export { meta, parser, rules }

export const configs = {
  ...configs_,
  flatBase,
  flatRecommended,
}

const SEVERITIES = ['info', 'warning', 'error'] as const

registerJsonMessageHandler(
  'markup/markup',
  ({ ruleId, severity, message }: Violation, { severity: eslintSeverity }) => ({
    ruleId: `markup/${ruleId}`,
    message,
    severity: Math.max(
      eslintSeverity,
      SEVERITIES.indexOf(severity),
    ) as TSESLint.Linter.Severity,
  }),
)
