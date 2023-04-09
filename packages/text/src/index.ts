import { TextlintMessage } from '@textlint/kernel'
import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { VFileMessage } from 'vfile-message'

export * as configs from './configs.js'
export * from './parser.js'
export * as rules from './rules/index.js'
export * from './types.js'

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
