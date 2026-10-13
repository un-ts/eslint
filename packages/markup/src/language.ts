import type { File, FileProblem, Language, SourceLocation } from '@eslint/core'
import {
  type Directive,
  TextSourceCodeBase,
  VisitNodeStep,
} from '@eslint/plugin-kit'
import { parser as htmlParser } from '@markuplint/html-parser'
import type { MLASTDocument } from '@markuplint/ml-ast'

import { parseDirectives } from './directives.js'
import type { MarkupSyntaxElement } from './syntax-element.js'

/**
 * Markup carries no language options of its own; configuration lives in markuplint's own files.
 */
export type MarkupLanguageOptions = Record<never, never>

/**
 * The spelling of the markup language in a flat config: `language: 'markup/html'`.
 */
export const HTML_LANGUAGE_NAME = 'html'

export type {
  MarkupPosition,
  MarkupPositionMapper,
  MarkupSyntaxElement,
} from './syntax-element.js'

/**
 * The node ESLint traverses a markup file from.
 *
 * The syntax itself is evaluated by markuplint through `markup/markup`, so this is the root the
 * bridge reports from; the parsed document travels alongside it as `MarkupParseResult.markuplint`.
 */
export interface MarkupDocument {
  type: 'Document'
  range: [number, number]
  loc: { start: SourceLocation['start']; end: SourceLocation['end'] }
}

/**
 * The `SourceCode` ESLint hands to rules for markup files.
 *
 * `TextSourceCodeBase` already implements everything ESLint requires apart from `traverse()` and
 * `getParent()`, and knows how to measure locations from the source text.
 */
export class MarkupSourceCode extends TextSourceCodeBase<{
  LangOptions: MarkupLanguageOptions
  RootNode: MarkupDocument
  SyntaxElementWithLoc: MarkupDocument | MarkupSyntaxElement
  ConfigNode: never
}> {
  /**
   * The document markuplint parsed, which is richer than the traversal root: it is what directives
   * are read from, and what node-level rules will report from once they exist.
   */
  readonly markuplint: MLASTDocument

  constructor({
    text,
    ast,
    markuplint,
  }: {
    text: string
    ast: MarkupDocument
    markuplint: MLASTDocument
  }) {
    super({ text, ast })
    this.markuplint = markuplint
  }

  override getParent(): undefined {
    return undefined
  }

  override traverse(): Iterable<VisitNodeStep> {
    return [new VisitNodeStep({ target: this.ast, phase: 1, args: [this.ast] })]
  }

  /**
   * HTML comments are how a markup file carries `eslint-disable` directives, and `TextSourceCodeBase`
   * knows nothing about comments, so ESLint has to be handed them.
   *
   * @returns the directives this file declares
   */
  getDisableDirectives(): {
    directives: Directive[]
    problems: FileProblem[]
  } {
    return parseDirectives(this.markuplint, this)
  }
}

/**
 * The markup language, published as `markup/html`.
 *
 * `parse()` has to be synchronous - ESLint rejects a language parser that returns a thenable - and
 * markuplint's HTML parser is, so the syntax tree is the real one rather than a stub. Only a parser
 * can tell an HTML comment apart from the same characters inside a script tag or an attribute
 * value, which a directive must not be read out of.
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
    const text = file.body as string

    return new MarkupSourceCode({
      text,
      ast,
      markuplint: htmlParser.parse(text),
    })
  }
}

export const html = new MarkupLanguage()
