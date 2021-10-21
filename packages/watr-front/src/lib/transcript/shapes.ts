/**
 * Shape types and serialization functions
 */
import * as io from 'io-ts';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import _ from 'lodash';
import { MinMaxBox } from '../coord-sys';
import { RTreeIndexable } from '~/components/basics/rtree-search';

function isKind<T>(k: string): (v: any) => v is T {
  return function f(a: any): a is T {
    return a.kind === k;
  };
}

export interface Point {
  kind: 'point';
  x: number;
  y: number;
}



export const PointRepr = io.tuple([io.number, io.number], 'PointRepr');
export type PointRepr = io.TypeOf<typeof PointRepr>;

export const Point = new io.Type<Point, PointRepr, unknown>(
  'Point', isKind('point'),
  (repr: unknown, c: io.Context) => pipe(
    PointRepr.validate(repr, c),
    E.chain(validRepr => io.success(uPoint(validRepr))),
  ),
  (a: Point) => [floatToIntRep(a.x), floatToIntRep(a.y)],
);

export interface Circle {
  kind: 'circle';
  p: Point;
  r: number;
}

export const CircleRepr = io.tuple([PointRepr, io.number], 'CircleRepr');
export type CircleRepr = io.TypeOf<typeof CircleRepr>;

export const Circle = new io.Type<Circle, CircleRepr, unknown>(
  'Circle', isKind('circle'),
  (repr: unknown, c: io.Context) => pipe(
    CircleRepr.validate(repr, c),
    E.chain(validRepr => io.success(uCircle(validRepr))),
  ),
  (a: Circle) => [Point.encode(a.p), floatToIntRep(a.r)],
);


export interface Line {
  kind: 'line';
  p1: Point;
  p2: Point;
}

export const LineRepr = io.tuple([PointRepr, PointRepr], 'LineRepr');
export type LineRepr = io.TypeOf<typeof LineRepr>;

export const Line = new io.Type<Line, LineRepr, unknown>(
  'Line', isKind('line'),
  (repr: unknown, c: io.Context) => pipe(
    LineRepr.validate(repr, c),
    E.chain(validRepr => io.success(uLine(validRepr))),
  ),
  (a: Line) => [Point.encode(a.p1), Point.encode(a.p2)],
);


export interface Triangle {
  kind: 'triangle';
  p1: Point;
  p2: Point;
  p3: Point;
}

export const TriangleRepr = io.tuple([PointRepr, PointRepr, PointRepr], 'TriangleRepr');
export type TriangleRepr = io.TypeOf<typeof TriangleRepr>;

export const Triangle = new io.Type<Triangle, TriangleRepr, unknown>(
  'Triangle', isKind('triangle'),
  (repr: unknown, c: io.Context) => pipe(
    TriangleRepr.validate(repr, c),
    E.chain(validRepr => io.success(uTriangle(validRepr))),
  ),
  (a: Triangle) => [Point.encode(a.p1), Point.encode(a.p2), Point.encode(a.p3)],
);

export interface Rect {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}


export const RectRepr =
  io.tuple([io.number, io.number, io.number, io.number], 'RectRepr');

export type RectRepr = io.TypeOf<typeof RectRepr>;

export const Rect = new io.Type<Rect, RectRepr, unknown>(
  'Rect', isKind('rect'),
  (u: unknown, c: io.Context) => pipe(
    RectRepr.validate(u, c),
    E.map(foo => {
      return foo;
    }),
    E.chain(validRepr => io.success(uRect(validRepr))),
  ),
  (a: Rect) => {
    const { x, y, width, height } = a;
    return [
      floatToIntRep(x),
      floatToIntRep(y),
      floatToIntRep(width),
      floatToIntRep(height),
    ];
  },
);

export interface Trapezoid {
  kind: 'trapezoid';
  topLeft: Point;
  topWidth: number;
  bottomLeft: Point;
  bottomWidth: number;
}

export const TrapezoidRepr = io.tuple(
  [PointRepr, io.number, PointRepr, io.number],
  'TrapezoidRepr',
);

export type TrapezoidRepr = io.TypeOf<typeof TrapezoidRepr>;

export const Trapezoid = new io.Type<Trapezoid, TrapezoidRepr, unknown>(
  'Trapezoid', isKind('trapezoid'),
  (repr: unknown, c: io.Context) => pipe(
    TrapezoidRepr.validate(repr, c),
    E.chain(validRepr => io.success(uTrapezoid(validRepr))),
  ),
  (a: Trapezoid) => [
    Point.encode(a.topLeft), floatToIntRep(a.topWidth),
    Point.encode(a.bottomLeft), floatToIntRep(a.bottomWidth),
  ],
);

/**
   * nb., the order of the shapes in the this Shape union is important.
   * The deserializer will test the encoded inputs against the
   * serialized form of the shapes in the order listed. So, e.g.,
   * a Triangle ([p1, p2, p3]) and a Line ([p1, p2]) must be tested in that
   * order, or else the Triangle will decode as  a line with some extra info
   * at the end.
   */
export const Shape = io.union([Rect, Point, Triangle, Trapezoid, Line, Circle], 'Shape');
export const ShapeRepr = io.union([RectRepr, PointRepr, TriangleRepr, TrapezoidRepr, LineRepr, CircleRepr], 'ShapeRepr');

export type Shape = io.TypeOf<typeof Shape>;
export type ShapeRepr = io.TypeOf<typeof ShapeRepr>;

export type ShapeKind = Shape['kind'];
// export type ShapeRepr = RectRepr | PointRepr | TriangleRepr | TrapezoidRepr | LineRepr | CircleRepr;

export interface BaseSvg extends RTreeIndexable {
  id: string;
  classes?: string[];
  data: Record<string, any>;
}
export interface PointSvg extends BaseSvg {
  type: 'circle';
  r: number;
  cx: number;
  cy: number;
}

export interface LineSvg extends BaseSvg {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RectSvg extends BaseSvg {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PathSvg extends BaseSvg {
  type: 'path';
  d: string;
}

// export interface GroupSvg extends BaseSvg {
//   type: 'g';
//   children: ShapeSvg[];
// }

export type ShapeSvg = PointSvg | LineSvg | RectSvg | PathSvg;

export function shapeToSvg(shape: Shape): ShapeSvg {

  switch (shape.kind) {
    case 'point':
      return <PointSvg>{
        type: 'circle',
        r: 3,
        cx: shape.x,
        cy: shape.y,
        minX: shape.x - 1.5,
        minY: shape.y - 1.5,
        maxX: shape.x + 1.5,
        maxY: shape.y + 1.5,
        data: {},
      };
    case 'line':
      return <LineSvg>{
        type: 'line',
        x1: shape.p1.x,
        y1: shape.p1.y,
        x2: shape.p2.x,
        y2: shape.p2.y,
        minX: Math.min(shape.p1.x, shape.p2.x),
        minY: Math.min(shape.p1.y, shape.p2.y),
        maxX: Math.max(shape.p1.x, shape.p2.x),
        maxY: Math.max(shape.p1.y, shape.p2.y),
        data: {},
      };
    case 'rect':
      return <RectSvg>{
        type: 'rect',
        x: shape.x,
        y: shape.y,
        width: Math.max(shape.width, 2),
        height: Math.max(shape.height, 2),
        minX: shape.x,
        minY: shape.y,
        maxX: shape.x + shape.width,
        maxY: shape.y + shape.height,
        data: {},
      };

    case 'circle':
      const r = shape.r;
      const r2 = r / 2;
      return <PointSvg>{
        type: 'circle',
        r: shape.r,
        cx: shape.p.x,
        cy: shape.p.y,
        minX: shape.p.x - r2,
        minY: shape.p.y - r2,
        maxX: shape.p.x + r2,
        maxY: shape.p.y + r2,
        data: {},
      };
    case 'triangle': {

      const { p1, p2, p3 } = shape;
      const minX = Math.min(p1.x, p2.x, p3.x);
      const maxX = Math.max(p1.x, p2.x, p3.x);
      const minY = Math.min(p1.y, p2.y, p3.y);
      const maxY = Math.max(p1.y, p2.y, p3.y);
      return <PathSvg>{
        type: 'path',
        d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`,
        minX, minY, maxX, maxY,
        data: {},
      };
    }
    case 'trapezoid': {

      const { topLeft, topWidth, bottomLeft, bottomWidth } = shape;
      const bottomRight = _.clone(bottomLeft);
      bottomRight.x += bottomWidth;
      const topRight = _.clone(topLeft);
      topRight.x += topWidth;

      const minX = Math.min(topLeft.x, bottomLeft.x);
      const maxX = Math.max(topRight.x, bottomRight.x);
      const minY = Math.min(topLeft.y, bottomLeft.y);
      const maxY = Math.max(topLeft.y, bottomLeft.y);

      return <PathSvg>{
        type: 'path',
        d: `M ${topLeft.x} ${topLeft.y} L ${bottomLeft.x} ${bottomLeft.y} L ${bottomRight.x} ${bottomRight.y} L ${topRight.x} ${topRight.y} Z`,
        minX, minY, maxX, maxY,
        data: {},
      };
    }
  }
}

function uFloat(n: number): number {
  return n / 100.0;
}

function floatToIntRep(n: number): number {
  return Math.round(n * 100.0);
}

function uPoint(repr: PointRepr): Point {
  const [x, y] = repr;
  return { kind: 'point', x: uFloat(x), y: uFloat(y) };
}

function uCircle(repr: CircleRepr): Circle {
  const [p, r] = repr;
  return { kind: 'circle', p: uPoint(p), r: uFloat(r) };
}

function uTriangle(repr: TriangleRepr): Triangle {
  const [p1, p2, p3] = repr;
  return { kind: 'triangle', p1: uPoint(p1), p2: uPoint(p2), p3: uPoint(p3) };
}

function uTrapezoid(repr: TrapezoidRepr): Trapezoid {
  const [tl, tw, bl, bw] = repr;
  return {
    kind: 'trapezoid',
    topLeft: uPoint(tl),
    topWidth: uFloat(tw),
    bottomLeft: uPoint(bl),
    bottomWidth: uFloat(bw),
  };
}

function uLine(repr: LineRepr): Line {
  const [p1, p2] = repr;
  return { kind: 'line', p1: uPoint(p1), p2: uPoint(p2) };
}

export function uRect(repr: RectRepr): Rect {
  const [x, y, w, h] = repr;
  return {
    kind: 'rect',
    x: uFloat(x),
    y: uFloat(y),
    width: uFloat(w),
    height: uFloat(h),
  };
}
export function minMaxToRect(mm: MinMaxBox): Rect {
  const { minX, minY, maxX, maxY } = mm;
  const x = minX;
  const y = minY;
  const width = maxX - minX;
  const height = maxY - minY;
  return { kind: 'rect', x, y, width, height };
}

export function formatShape(shape: Shape): string {
  switch (shape.kind) {
    case 'point':
      return `(${shape.x},${shape.y})`;
    case 'line':
      return `l@{${formatShape(shape.p1)}->${formatShape(shape.p2)}}`;
    case 'rect':
      return `r@[(${shape.x},${shape.y}); w:${shape.width}; h:${shape.height}]`;
    case 'circle':
      return `c@${formatShape(shape.p)}, r:(${shape.r})`;
    case 'triangle':
      return `tri@<(${formatShape(shape.p1)}, ${formatShape(shape.p2)}, ${formatShape(shape.p3)}>`;
    case 'trapezoid':
      return `trap@<${formatShape(shape.topLeft)}->${shape.topWidth}, ${formatShape(shape.bottomLeft)}->${shape.bottomWidth}>`;
  }
}
