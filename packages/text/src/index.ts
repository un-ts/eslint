import type { TextlintMessage } from '@textlint/kernel'
import type { TSESLint } from '@typescript-eslint/utils'
import { jsonMessage, registerJsonMessageHandler } from 'eslint-plugin-utils'
import type { VFileMessage } from 'vfile-message'

import * as configs_ from './configs.js'
import * as meta from './meta.js'
import * as parser from './parser.js'
import * as rules from './rules/index.js'

export * from './helpers.js'

export const text: TSESLint.Linter.Plugin = { meta, rules }

const flatBase: TSESLint.FlatConfig.Config = {
  name: 'text/flat-base',
  files: ['**/*'],
  plugins: { text },
  processor: jsonMessage,
  languageOptions: { parser },
  rules: configs_.recommended.rules,
}

const flatRecommended: TSESLint.FlatConfig.Config = {
  ...flatBase,
  name: 'text/flat-recommended',
}

export { meta, parser, rules }

export const configs = {
  ...configs_,
  flatBase,
  flatRecommended,
}

registerJsonMessageHandler(
  'text/retext',
  ({ ruleId, message, url }: VFileMessage) => ({
    ruleId: `retext/${ruleId!}`,
    message: `${message}
reference: ${
      // istanbul ignore next
      url ?? '-'
    }`,
  }),
)

registerJsonMessageHandler(
  'text/textlint',
  ({ ruleId, message }: TextlintMessage) => ({
    ruleId: `textlint/${ruleId}`,
    message: `${message}`,
  }),
)
