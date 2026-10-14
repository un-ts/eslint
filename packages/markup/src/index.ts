import type { Violation } from '@markuplint/ml-config'
import type { TSESLint } from '@typescript-eslint/utils'
import { jsonMessage, registerJsonMessageHandler } from 'eslint-plugin-utils'

import * as configs_ from './configs.js'
import { html } from './language.js'
import * as meta from './meta.js'
import * as parser from './parser.js'
import * as rules from './rules/index.js'
import { mappedRules } from './rules-mapped.js'

const languages = { html }

/**
 * `languages` is part of ESLint's plugin contract, but neither
 * `@typescript-eslint/utils`' `Linter.Plugin` nor its `FlatConfig.Plugin` declares it yet, so it is
 * added here rather than cast away.
 */
interface PluginWithLanguages extends TSESLint.Linter.Plugin {
  languages: typeof languages
}

/** The bridge rule plus one rule per markuplint rule, so both models can be adopted. */
const allRules = { ...rules, ...mappedRules }

const markup: PluginWithLanguages = {
  meta,
  languages,
  rules: allRules,
}

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

/**
 * The same configuration expressed with the `markup/html` language instead of a stub parser, for
 * consumers who want `language: 'markup/html'` in their own config block.
 */
const flatLanguage: TSESLint.FlatConfig.Config = {
  name: 'markup/flat-language',
  files: ['**/*.html'],
  plugins: { markup },
  processor: jsonMessage,
  language: 'markup/html',
}

const flatRecommendedLanguage: TSESLint.FlatConfig.Config = {
  ...flatLanguage,
  name: 'markup/flat-recommended-language',
  rules: configs_.recommended.rules,
}

export { html, languages, mappedRules, meta, parser, rules }
export {
  HTML_LANGUAGE_NAME,
  MarkupLanguage,
  MarkupSourceCode,
} from './language.js'
export { MARKUPLINT_RULE_NAMES } from './rule-names.js'

export const configs = {
  ...configs_,
  flatBase,
  flatLanguage,
  flatRecommended,
  flatRecommendedLanguage,
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
