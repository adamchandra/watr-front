import _ from 'lodash';
import { GlyphPropsRepr, GlyphRepr } from './glyph';

export function rewriteChar(char: string): string {
  switch (char) {
    case 'ﬃ': return 'ffi';
  }
  return char;
}

// function rewriteStr(str: string): string {
//   return _.map(str, s => rewriteChar(s));
// }

export function makeGlyphRepr(char: string): GlyphRepr {
  let gchar = char;
  let gprops: GlyphPropsRepr | undefined;

  switch (char) {
    case 'ﬃ':
      gchar = 'ffi';
      gprops = { kind: 'rewrite', gs: [['ﬃ', 1, [19, 94, 9, 10]]] };
      break;
  }
  const repr: GlyphRepr = gprops
    ? [gchar, 2, [100, 200, 300, 400], gprops]
    : [gchar, 3, [100, 200, 300, 400]];

  return repr;
}

export function makeGlyphReprs(str: string): GlyphRepr[] {
  const reprs = _.map(str, char => makeGlyphRepr(char));
  return reprs;
}

export const sampleTranscript = {
  documentId: 'doc-25-id',
  pageCount: 4,
  glyphCount: 200,
  pages: [
    {
      page: 1,
      bounds: [0, 0, 100, 200],
      glyphCount: 200,
      glyphs: [
        ['a', 0, [100, 200, 300, 400]],
        [' ', 1, [1, 2, 3, 4]],
        ['ffi', 2, [10, 2, 3, 4], { kind: 'rewrite', gs: [['ﬃ', 3, [19, 94, 9, 10]]] }],
        ['â', 4, [19, 94, 9, 10], { kind: 'rewrite', gs: [['a', 5, [19, 94, 9, 10]], ['^', 6, [19, 94, 9, 10]]] }],
      ],
    },
  ],
  stanzas: [
    {
      lines: [
        { glyphs: [0, 1] },
      ],
      labels: [

      ],

    },
  ],
  labels: [
    { name: 'HasReferences', range: [{ unit: 'page', at: { page: 10 } }] },
  ],
};
