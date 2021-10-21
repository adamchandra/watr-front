import _ from 'lodash';

import { Rect, RectRepr } from './shapes';
import * as io from 'io-ts';
import * as Arr from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { NonNegativeInt } from '~/lib/codec-utils';

/**
 * Glyphs are represented in JSON as tuples, as defined by GlyphRepr* and GlyphPropsRepr*
 */

///
/// Define the *Repr* serialization types for Glyphs / GlyphProps
///
export interface GlyphPropsRepr {
  kind: string;
  gs?: GlyphRepr[];
}

const GlyphRepr1 = io.tuple([io.string, io.number, RectRepr], 'GlyphRepr1');
type GlyphRepr1 = io.TypeOf<typeof GlyphRepr1>;

type GlyphRepr2 = [string, number, RectRepr, GlyphPropsRepr];
const GlyphRepr2: io.Type<GlyphRepr2> =
  io.recursion(
    'GlyphRepr2',
    () => io.tuple([io.string, io.number, RectRepr, GlyphPropsRepr]),
  );


export type GlyphRepr = GlyphRepr1 | GlyphRepr2;
export const GlyphRepr: io.Type<GlyphRepr> =
  io.recursion(
    'GlyphRepr',
    () => io.union([GlyphRepr2, GlyphRepr1], 'GlyphRepr'), // n.b. GlyphRepr*[] is order dependent
  );

export const GlyphPropsRepr: io.Type<GlyphPropsRepr> =
  io.intersection([
    io.type({ kind: io.string }),
    io.partial({ gs: io.array(GlyphRepr) }),
  ], 'GlyphPropsRepr');


//////
/// Define the Glyph/GlyphProps types

export interface Glyph {
  char: string;
  id: number;
  rect: Rect;
  props?: GlyphProps;
}

export interface GlyphProps {
  kind: string;
  gs?: Glyph[];
}

const decodeGlyphProps: (unk: unknown, ctx: io.Context) => E.Either<io.Errors, GlyphProps> =
  (unk: unknown, ctx: io.Context) => {

    const validateGlyph = (g: GlyphRepr): E.Either<io.Errors, Glyph> => Glyph.validate(g, ctx);

    const traverseGlyphs = Arr.traverse(E.Applicative)(validateGlyph);
    return pipe(
      unk,
      v => GlyphPropsRepr.validate(v, ctx),
      E.chain(({ kind, gs }) => {
        if (gs) {
          const gsValid = traverseGlyphs(gs);

          const mapf = E.map(((gs: Glyph[]) => ({ kind, gs } as GlyphProps)));

          return mapf<io.Errors>(gsValid);
        }
        return E.right({ kind });
      }),
    );
  };

export const GlyphProps: io.Type<GlyphProps, GlyphPropsRepr, unknown> =
  new io.Type<GlyphProps, GlyphPropsRepr, unknown>(
    'GlyphProps',
    (a: any): a is GlyphProps => {
      const k = a.kind;
      const gs = a.gs;
      return io.string.is(k) && io.array(Glyph).is(gs);
    },
    (unk: unknown, ctx: io.Context) => decodeGlyphProps(unk, ctx),
    (a: GlyphProps) => {
      const { kind, gs } = a;
      const propsRepr = GlyphPropsRepr.encode({ kind });
      if (gs) {
        propsRepr.gs = _.map(gs, Glyph.encode);
      }
      return propsRepr;
    },
  );

// const seqTupleEither = Ap.sequenceT(E.either);

export const Glyph: io.Type<Glyph, GlyphRepr, unknown> =
  new io.Type<Glyph, GlyphRepr, unknown>(
    'Glyph',
    (a: any): a is Glyph =>
      io.string.is(a.char)
      && NonNegativeInt.is(a.id)
      && Rect.is(a.rect)
      && (a.props === undefined || GlyphProps.is(a.props)),

    (unk: unknown, ctx: io.Context) => pipe(
      GlyphRepr.validate(unk, ctx),
      E.bindTo('repr'),
      E.bind('char', ({ repr: [char, _id, _rect, _props] }) => io.success(char)),
      E.bind('id', ({ repr: [_char, id, _rect, _props] }) => io.success(id)),
      E.bind('rect', ({ repr: [_char, _id, rect, _props] }) => Rect.decode(rect)),
      E.bind('props', ({ repr: [_char, _id, _rect, props] }) => props !== undefined ?
        decodeGlyphProps(props, ctx) : io.success(undefined)),
      E.chain(({ char, id, rect, props }) => {
        const g: Glyph = { char, id, rect };
        if (props !== undefined) {
          g.props = props;
        }
        return io.success(g);
      }),
    ),

    (a: Glyph) => {
      return (a.props === undefined
        ? [a.char, a.id, Rect.encode(a.rect)]
        : [a.char, a.id, Rect.encode(a.rect), GlyphProps.encode(a.props)]);
    },
  );
