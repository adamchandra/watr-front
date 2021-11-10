import _ from 'lodash';
import { GlyphPropsRepr, GlyphRepr } from './glyph';
import { line, point, Shape } from './shapes';
import { Label, Range } from './labels';

export function rewriteChar(char: string): string {
  switch (char) {
    case 'ﬃ': return 'ffi';
  }
  return char;
}

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

export class LabelBuilder {
  lbl: Label;

  public constructor(name: string) {
    this.lbl = { name, range: [] };
  }

  public withRange(r: Range): LabelBuilder {
    this.lbl.range.push(r);
    return this;
  }

  public withProps(key: string, vals: string[]): LabelBuilder {
    if (this.lbl.props === undefined) {
      this.lbl.props = {};
    }
    _.merge(this.lbl.props, { key, vals });

    return this;
  }

  public withChildren(childs: Label[]): LabelBuilder {
    if (this.lbl.children === undefined) {
      this.lbl.children = [];
    }
    this.lbl.children = _.concat(this.lbl.children, childs);
    return this;
  }

  public get(): Label {
    return this.lbl;
  }
}

export const examples: any[] = [
  label('HorizonLine')
    .withRange(range(line(point(10, 20), point(30, 40))))
    .withProps('role', ['underline']),
];

export function range(
  shape: Shape
): Range {
  return {
    unit: 'shape',
    at: shape
  };
}

export function label(
  name: string,
): LabelBuilder {
  return new LabelBuilder(name);
}
