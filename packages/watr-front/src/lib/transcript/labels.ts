import _ from 'lodash';

import { Shape, ShapeRepr } from './shapes';
import * as io from 'io-ts';
import { PageNumber, Span } from '~/lib/codec-utils';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';

const DocumentRange = io.type({
  unit: io.literal('document'),
  at: io.string
});
type DocumentRange = io.TypeOf<typeof DocumentRange>;

const LabelRange = io.type({
  unit: io.literal('label'),
  at: io.number
});
type LabelRange = io.TypeOf<typeof LabelRange>;

export const TextLabelUnit = io.keyof({
  'text:line': null,
  'text:char': null,
});

const TextRange = io.type({
  unit: TextLabelUnit,
  at: Span
}, 'TextRange');

type TextRange = io.TypeOf<typeof TextRange>;

const StanzaRange = io.type({
  unit: io.literal('stanza'),
  at: io.number
});

type StanzaRange = io.TypeOf<typeof StanzaRange>;

const PageRange = io.type({
  unit: io.literal('page'),
  at: PageNumber
});

export type PageRange = io.TypeOf<typeof PageRange>;

const GeometricRangeRepr = io.type({
  unit: io.literal('shape'),
  at: ShapeRepr
}, 'GeometricRangeRepr');


type GeometricRangeRepr = io.TypeOf<typeof GeometricRangeRepr>;

type GeometricRange = {
  unit: 'shape',
  at: Shape
};

const GeometricRangeStrict = new io.Type<GeometricRange, GeometricRangeRepr, unknown>(
  'GeometricRange', (u: any): u is GeometricRange => io.string.is(u['unit']) && u['unit'] === 'shape',
  (repr: unknown, c: io.Context) => pipe(
    GeometricRangeRepr.validate(repr, c),
    E.chain(r => Shape.validate(r.at, c)),
    E.chain(r => io.success({ unit: 'shape', at: r })),
  ),
  (a: GeometricRange) => ({ unit: 'shape', at: Shape.encode(a.at) })
);

const GeometricRange = new io.Type<GeometricRange, GeometricRangeRepr, unknown>(
  'GeometricRange', (u: any): u is GeometricRange => (
    io.UnknownRecord.is(u)
    && io.string.is(u['unit'])
    && u['unit'] === 'shape'
  ),
  (repr: unknown, _: io.Context) => pipe(
    GeometricRangeRepr.decode(repr),
    E.chain(r => Shape.decode(r.at)),
    E.chain(r => io.success({ unit: 'shape', at: r })),
  ),
  (a: GeometricRange) => ({ unit: 'shape', at: Shape.encode(a.at) })
);

export const RangeRepr = io.union([
  GeometricRangeRepr,
  PageRange,
  TextRange,
  StanzaRange,
  DocumentRange,
  LabelRange,
]);

export type RangeRepr = io.TypeOf<typeof RangeRepr>;

export const Range = io.union([
  GeometricRange,
  PageRange,
  TextRange,
  StanzaRange,
  DocumentRange,
  LabelRange,
]);
export type Range = io.TypeOf<typeof Range>;

export interface LabelPartials {
  id?: number;
  children?: Label[];
  props?: Record<string, string[]>;
}

export interface Label extends LabelPartials {
  name: string;
  range: Range[];
}

export interface LabelRepr {
  name: string;
  id?: number;
  range: RangeRepr[];
  children?: LabelRepr[];
  props?: Record<string, string[]>;
}

export const LabelRepr: io.Type<LabelRepr> = io.recursion(
  'LabelRepr',
  () => io.intersection([
    LabelNameRangeRepr,
    LabelPartialsRepr
  ], 'LabelRepr')
);

export const LabelNameRangeRepr = io.type({
  name: io.string,
  range: io.array(RangeRepr),
}, 'LabelNameRangeRepr');
export type LabelNameRangeRepr = io.TypeOf<typeof LabelNameRangeRepr>;



export const LabelPartialsRepr = io.partial({
  id: io.number,
  children: io.array(LabelRepr),
  props: io.record(io.string, io.array(io.string))
});
export type LabelPartialsRepr = io.TypeOf<typeof LabelPartialsRepr>;

export const LabelPartials: io.Type<LabelPartials, LabelPartialsRepr, unknown> = io.recursion(
  'LabelPartials',
  () => io.partial({
    id: io.number,
    children: io.array(Label)
  })
);


export const Label = new io.Type<Label, LabelRepr, unknown>(
  'Label',

  (u: any): u is Label =>
    io.string.is(u['name']) && io.array(Range).is(u['range']),

  (unk: unknown, c: io.Context) => {
    try {
      const { id, props, children } = unk as LabelPartialsRepr;
      const { name, range } = unk as LabelNameRangeRepr;
      const rangeResult: Range[] = range.map(r => {
        if (GeometricRangeRepr.is(r)) {
          return GeometricRange.decode(r);
        }
        return Range.decode(r);
      }).map(r => {
        if (E.isRight(r)) return r.right;
        throw new Error('isLeft');
      });

      const result: Label = {
        name, range: rangeResult
      }

      if (children !== undefined) {
        const childResults: Label[] = children.map(ch => {
          const dec: E.Either<any, Label> = Label.decode(ch);
          if (E.isRight(dec)) return dec.right;
          throw new Error('isLeft');
        });
        result.children = childResults;
      }


      if (id !== undefined) result.id = id;
      if (props !== undefined) result.props = props;

      return io.success(result)

    } catch (error) {
      console.log('error validating label', unk);
    }
    return LabelWithContext.validate(unk, c);
  },
  (a: Label) => {
    const lenc: LabelRepr = {
      name: a.name,
      range: io.array(Range).encode(a.range)
    };
    const partials = LabelPartials.encode(a);
    if (partials.id !== undefined) {
      lenc.id = partials.id;
    }
    if (partials.children !== undefined) {
      lenc.children = partials.children;
    }
    if (partials.props !== undefined) {
      lenc.props = partials.props;
    }
    return lenc;
  }
);


const LabelWithContext = new io.Type<Label, LabelRepr, unknown>(
  'Label',

  (u: any): u is Label =>
    io.string.is(u['name']) && io.array(Range).is(u['range']),

  (unk: unknown, c: io.Context) => pipe(
    LabelRepr.validate(unk, c),
    E.bindTo('repr'),
    E.bind('partials', ({ repr }) => LabelPartialsRepr.validate(repr, c)),
    E.bind('range', ({ repr }) => io.array(Range).validate(repr.range, c)),
    E.bind('label', ({ repr, range }) => io.success({ name: repr.name, range })),
    E.bind('id', ({ partials: { id } }) => id === undefined ? io.success({}) : io.success({ id })),
    E.bind('props', ({ partials: { props } }) => props === undefined ? io.success({}) : io.success({ props })),
    E.bind('childArray', ({ partials: { children } }) => children === undefined ? io.success([]) : io.array(Label).validate(children, c)),
    E.bind('children', ({ childArray }) => childArray.length === 0 ? io.success({}) : io.success({ children: childArray })),
    E.chain(({ label, id, children, props }) => io.success(_.merge(label, id, children, props)))
  ),
  (a: Label) => {
    const lenc: LabelRepr = {
      name: a.name,
      range: io.array(Range).encode(a.range)
    };
    const partials = LabelPartials.encode(a);
    if (partials.id !== undefined) {
      lenc.id = partials.id;
    }
    if (partials.children !== undefined) {
      lenc.children = partials.children;
    }
    if (partials.props !== undefined) {
      lenc.props = partials.props;
    }
    return lenc;
  }
);
