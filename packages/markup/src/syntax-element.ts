/**
 * Where something is in markup source code. ESLint locations are 1-based lines and 0-based columns,
 * which is what this language declares to ESLint.
 */
export interface MarkupPosition {
  line: number
  column: number
}

/**
 * The only thing this language needs from a `SourceCode` to place a piece of text: directives are
 * resolved from the source and its locations, not from syntax nodes.
 */
export interface MarkupPositionMapper {
  getLocFromIndex(index: number): MarkupPosition
}

/**
 * Something that has to carry a source location but is not a syntax node, such as the HTML comment
 * a directive arrived in.
 */
export interface MarkupSyntaxElement {
  type: string
  range: [number, number]
  loc: { start: MarkupPosition; end: MarkupPosition }
}

/**
 * Builds a location-carrying element for a piece of source that starts at `start`.
 *
 * markuplint's syntax nodes only carry their own start, so the end is measured from the text, which
 * is what `code` is for.
 *
 * @param start - the 0-based offset the element begins at
 * @param raw - the source text the element is made of
 * @param code - the position mapper to convert offsets with
 * @returns the element
 */
export const buildSyntaxElement = (
  start: number,
  raw: string,
  code: MarkupPositionMapper,
): MarkupSyntaxElement => ({
  type: 'comment',
  range: [start, start + raw.length],
  loc: {
    start: code.getLocFromIndex(start),
    end: code.getLocFromIndex(start + raw.length),
  },
})
