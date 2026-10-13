import type { FileProblem } from '@eslint/core'
import { ConfigCommentParser, Directive } from '@eslint/plugin-kit'
import type { MLASTDocument } from '@markuplint/ml-ast'

import type {
  MarkupPositionMapper,
  MarkupSyntaxElement,
} from './syntax-element.js'
import { buildSyntaxElement } from './syntax-element.js'

export interface MarkupDirectives {
  directives: Directive[]
  problems: FileProblem[]
}

const commentParser = new ConfigCommentParser()

/** The directive labels ESLint understands, mapped to the type `Directive` takes. */
const DIRECTIVE_TYPES = {
  'eslint-disable': 'disable',
  'eslint-enable': 'enable',
  'eslint-disable-line': 'disable-line',
  'eslint-disable-next-line': 'disable-next-line',
} as const

type DirectiveType = (typeof DIRECTIVE_TYPES)[keyof typeof DIRECTIVE_TYPES]

const directiveTypeOf = (label: string): DirectiveType | undefined =>
  DIRECTIVE_TYPES[label as keyof typeof DIRECTIVE_TYPES]

const COMMENT_OPEN = '<!--'
const COMMENT_CLOSE = '-->'

/**
 * The `eslint ...` body of an HTML comment, or nothing when the comment does not look like one.
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
 * The comments come from the syntax tree rather than from a scan of the text, because only a parser
 * can tell a comment apart from the same characters inside a script tag or an attribute value.
 *
 * A directive only needs its text and its location, never a document node, so this works while the
 * markup tree is still only used as a root to report from.
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

    const { raw, offset } = node
    const parsed = parseComment(raw)
    if (!parsed) {
      continue
    }

    const type = directiveTypeOf(parsed.label)
    if (!type) {
      // a plain comment, or one that only mentions a directive
      continue
    }

    const element: MarkupSyntaxElement = buildSyntaxElement(offset, raw, code)

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
