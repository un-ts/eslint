import type { FileProblem } from '@eslint/core'
import { ConfigCommentParser, Directive } from '@eslint/plugin-kit'
import type { MLASTDocument } from '@markuplint/ml-ast'

/**
 * Where something is in markup source code. ESLint locations are 1-based lines and 0-based columns,
 * which is what this language declares to ESLint.
 */
export interface MarkupPosition {
  line: number
  column: number
}

/** The part of a `SourceCode` the directives are measured with. */
export interface MarkupPositionMapper {
  getLocFromIndex(index: number): MarkupPosition
}

/** Something that carries a source location without being a syntax node, such as a comment. */
export interface MarkupSyntaxElement {
  type: string
  range: [number, number]
  loc: { start: MarkupPosition; end: MarkupPosition }
}

export interface MarkupDirectives {
  directives: Directive[]
  problems: FileProblem[]
}

const commentParser = new ConfigCommentParser()

/** The directive labels ESLint understands, mapped to the type `Directive` takes. */
const DIRECTIVE_TYPES = new Map<string, Directive['type']>([
  ['eslint-disable', 'disable'],
  ['eslint-enable', 'enable'],
  ['eslint-disable-line', 'disable-line'],
  ['eslint-disable-next-line', 'disable-next-line'],
])

const COMMENT_OPEN = '<!--'
const COMMENT_CLOSE = '-->'

/**
 * The `eslint ...` body of an HTML comment, or nothing when the comment is not a directive.
 *
 * `parseDirective()` is shared with ESLint's other languages and expects the comment delimiters
 * already stripped, which is what this does.
 *
 * @param raw - the whole comment, `<!-- ... -->`
 * @returns the parsed directive, if the comment is one
 */
const parseComment = (raw: string) =>
  raw.startsWith(COMMENT_OPEN) && raw.endsWith(COMMENT_CLOSE)
    ? commentParser.parseDirective(
        raw.slice(COMMENT_OPEN.length, -COMMENT_CLOSE.length).trim(),
      )
    : undefined

/**
 * Resolves the `eslint-disable*` directives a markup file carries in its HTML comments.
 *
 * The comments come from the parsed document rather than from a scan of the text: only a parser can
 * tell an HTML comment from the same characters inside a script tag or an attribute value, and a
 * directive must not be read out of those.
 *
 * @param ast - the parsed markup document
 * @param code - the position mapper of the `SourceCode` the directives belong to
 * @returns the directives ESLint should apply, and anything wrong with them
 */
export const parseDirectives = (
  ast: MLASTDocument,
  code: MarkupPositionMapper,
): MarkupDirectives => {
  const directives: Directive[] = []
  const problems: FileProblem[] = []

  for (const node of ast.nodeList) {
    if (node.type !== 'comment') {
      continue
    }

    const parsed = parseComment(node.raw)
    if (!parsed) {
      continue
    }

    const type = DIRECTIVE_TYPES.get(parsed.label)
    if (!type) {
      continue
    }

    const start = node.offset
    const end = start + node.raw.length
    const element: MarkupSyntaxElement = {
      type: 'comment',
      range: [start, end],
      loc: {
        start: code.getLocFromIndex(start),
        end: code.getLocFromIndex(end),
      },
    }

    // `eslint-disable-line` names one line, so a comment spanning several of them is ambiguous:
    // that is a problem, not a directive.
    if (
      type === 'disable-line' &&
      element.loc.start.line !== element.loc.end.line
    ) {
      problems.push({
        ruleId: null,
        message: `${parsed.label} comment should not span multiple lines.`,
        loc: element.loc,
      })
      continue
    }

    directives.push(
      new Directive({
        type,
        node: element,
        value: parsed.value,
        justification: parsed.justification,
      }),
    )
  }

  return { directives, problems }
}
