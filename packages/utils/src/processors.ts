import { Linter } from 'eslint'

import { jsonMessageHandlers } from './helpers'

export const jsonMessage: Linter.Processor = {
  supportsAutofix: true,
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
