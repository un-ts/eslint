import { TextlintMessage } from '@textlint/kernel'
import { registerJsonMessageHandler } from 'eslint-plugin-utils'
import { VFileMessage } from 'vfile-message'

export * as configs from './configs'
export * from './parser'
export * as rules from './rules'
export * from './types'

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
