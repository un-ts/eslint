import type { File, Language, SourceLocation } from '@eslint/core'
import { TextSourceCodeBase, VisitNodeStep } from '@eslint/plugin-kit'

/**
 * The node a markup language file is rooted at.
 *
 * ESLint only needs one traversable node here: the syntax itself is evaluated by markuplint through
 * `markup/markup`, so this tree exists to give that rule somewhere to report from rather than to
 * model the document.
 */
export interface MarkupDocument {
  type: 'Document'
  range: [number, number]
  loc: { start: SourceLocation['start']; end: SourceLocation['end'] }
}

/**
 * Markup carries no language options of its own; configuration lives in markuplint's own files.
 */
export type MarkupLanguageOptions = Record<never, never>

/**
 * The spelling of the markup language in a flat config: `language: 'markup/html'`.
 */
export const HTML_LANGUAGE_NAME = 'html'

/**
 * The `SourceCode` ESLint hands to rules for markup files.
 *
 * `TextSourceCodeBase` already implements everything ESLint requires apart from `traverse()` and
 * `getParent()`, and understands the ESTree-style `loc` and `range` this language emits.
 */
export class MarkupSourceCode extends TextSourceCodeBase<{
  LangOptions: MarkupLanguageOptions
  RootNode: MarkupDocument
  SyntaxElementWithLoc: MarkupDocument
  ConfigNode: never
}> {
  override getParent(): undefined {
    return undefined
  }

  override traverse(): Iterable<VisitNodeStep> {
    return [new VisitNodeStep({ target: this.ast, phase: 1, args: [this.ast] })]
  }
}

/**
 * The markup language, published as `markup/html`.
 *
 * `parse()` stays deliberately cheap and synchronous: ESLint rejects a language parser that returns
 * a thenable, and the parsing `markup/markup` needs happens inside markuplint's own worker rather
 * than twice per file.
 */
export class MarkupLanguage implements Language<{
  LangOptions: MarkupLanguageOptions
  Code: MarkupSourceCode
  RootNode: MarkupDocument
  Node: MarkupDocument
}> {
  fileType = 'text' as const
  lineStart = 1 as const
  columnStart = 0 as const
  nodeTypeKey = 'type'

  visitorKeys: Record<string, string[]> = { Document: [] }

  /**
   * Markup has no language options of its own, so there is nothing to reject; the method still has
   * to exist because `Language` requires it.
   */
  validateLanguageOptions(): void {
    // no options to validate
  }

  parse(file: File): { ok: true; ast: MarkupDocument } {
    // Note: BOM has already been removed by ESLint
    const text = file.body as string
    const lines = text.split('\n')

    return {
      ok: true,
      ast: {
        type: 'Document',
        range: [0, text.length],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: lines.length, column: lines.at(-1)?.length ?? 0 },
        },
      },
    }
  }

  createSourceCode(
    file: File,
    { ast }: { ast: MarkupDocument },
  ): MarkupSourceCode {
    return new MarkupSourceCode({ text: file.body as string, ast })
  }
}

export const html = new MarkupLanguage()
