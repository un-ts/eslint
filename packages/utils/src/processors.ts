import type { TSESLint } from '@typescript-eslint/utils'

import { jsonMessageHandlers } from './helpers.js'
import { version } from './meta.js'

export const jsonMessage: TSESLint.Processor.ProcessorModule = {
  meta: {
    name: 'utils:json-message',
    version,
  },
  supportsAutofix: true,
  preprocess(text) {
    return [text]
  },
  postprocess(messagesList) {
    return messagesList.flatMap(messages =>
      messages.map(lintMessage => {
        const { ruleId, message } = lintMessage

        /* istanbul ignore if */
        if (!ruleId || !jsonMessageHandlers.has(ruleId)) {
          return lintMessage
        }

        const handler = jsonMessageHandlers.get(ruleId)!

        try {
          return {
            ...lintMessage,
            ...handler(JSON.parse(message), lintMessage),
          }
        } catch (err) /* istanbul ignore next */ {
          console.error(
            `Error occurred on processing ruleId: ${ruleId} and message: ${message}.`,
          )
          throw err
        }
      }),
    )
  },
}
