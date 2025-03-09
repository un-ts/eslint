import type { TextlintMessage } from '@textlint/kernel'
import type { TSESLint } from '@typescript-eslint/utils'
import { processors, registerJsonMessageHandler } from 'eslint-plugin-utils'
import { VFileMessage } from 'vfile-message'

import * as configs_ from './configs.js'
import * as meta from './meta.js'
import * as parser from './parser.js'
import * as rules from './rules/index.js'

const markup: TSESLint.Linter.Plugin = {
  meta,
  rules,
  processors,
}

const flatBase: TSESLint.FlatConfig.Config = {
  name: 'text/flat-base',
  files: ['**/*'],
  plugins: {
    markup,
  },
  languageOptions: {
    parser,
  },
}

const flatRecommended: TSESLint.FlatConfig.Config = {
  ...flatBase,
  name: 'text/flat-recommended',
  rules: configs_.recommended.rules,
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
