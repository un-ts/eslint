import type { TSESLint } from '@typescript-eslint/utils'
import { registerJsonMessageHandler, processors } from 'eslint-plugin-utils'
import type { Hint } from 'htmlhint/types.js'

import * as configs_ from './configs.js'
import * as meta from './meta.js'
import * as parser from './parser.js'
import * as rules from './rules/index.js'

const htm: TSESLint.Linter.Plugin = {
  meta,
  rules,
  processors,
}

const flatBase: TSESLint.FlatConfig.Config = {
  name: 'htm/flat-base',
  files: ['**/*.html'],
  plugins: {
    htm,
  },
  languageOptions: {
    parser,
  },
}

const flatRecommended: TSESLint.FlatConfig.Config = {
  ...flatBase,
  name: 'htm/flat-recommended',
  rules: configs_.recommended.rules,
}

export { meta, parser, rules }

export const configs = {
  ...configs_,
  flatBase,
  flatRecommended,
}

registerJsonMessageHandler('htm/html', ({ evidence, rule, message }: Hint) => ({
  ruleId: `htm/${rule.id}`,
  message: `${message}
evidence: ${evidence}
reference: ${
    // istanbul ignore next
    rule.link ?? '-'
  }`,
}))
