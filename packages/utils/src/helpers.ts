import { Linter } from 'eslint'

export interface JsonMessage {
  severity?: Linter.Severity
  message: string
  ruleId: string
}

export type JsonMessageHandler<T> = (
  jsonMessage: T,
  lintMessage: Linter.LintMessage,
) => JsonMessage

// @internal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsonMessageHandlers = new Map<string, JsonMessageHandler<any>>()

export const registerJsonMessageHandler = <T>(
  ruleId: string,
  handler: JsonMessageHandler<T>,
) => {
  /* istanbul ignore if */
  if (jsonMessageHandlers.has(ruleId)) {
    console.warn(
      `The ruleId ${ruleId} has already been registered, please mark sure you know what you're doing!`,
    )
  }

  jsonMessageHandlers.set(ruleId, handler)
}
