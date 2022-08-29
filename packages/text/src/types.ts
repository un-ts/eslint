import type { TextlintMessage } from '@textlint/kernel'
import type { Plugin } from 'unified'
import type { VFileMessage } from 'vfile-message'

export type UnifiedPlugin = Plugin | string

export interface UnifiedConfig {
  settings: Record<string, string>
  plugins: Array<UnifiedPlugin | [UnifiedPlugin, ...unknown[]]>
}

export type Linter = 'retext' | 'textlint'

export interface WorkerOptions<T extends Linter = Linter> {
  text: string
  filename: string
  linter: T
  fix?: boolean
  ignoreRetextConfig?: boolean
}

export interface WorkerResult<T extends Linter = Linter> {
  messages: Linter extends T
    ? TextlintMessage[] | VFileMessage[]
    : 'retext' extends T
    ? VFileMessage[]
    : TextlintMessage[]
  content: string
}
