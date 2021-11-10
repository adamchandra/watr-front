/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-redeclare */

/**
 * Shape types and serialization functions
 */
import * as io from 'io-ts';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import _ from 'lodash';

function isKind<T>(k: string): (v: any) => v is T {
  return function f(a: any): a is T {
    return a.kind === k;
  };
}

function floatFromRepr(n: number): number {
  return n / 100;
}

function floatToRepr(n: number): number {
  return Math.round(n * 100);
}

/// ==========
// Points
//
export interface Point {
  kind: 'point';
  x: number;
  y: number;
}

export const PointRepr = io.tuple([io.number, io.number], 'PointRepr');
export type PointRepr = io.TypeOf<typeof PointRepr>;

export function point(x: number, y: number): Point {
  return { kind: 'point', x, y };
}

function pointFromRepr(repr: PointRepr): Point {
  const [x, y] = repr;
  return point(floatFromRepr(x), floatFromRepr(y));
}

export const Point = new io.Type<Point, PointRepr, unknown>(
  'Point', isKind('point'),
  (repr: unknown, c: io.Context) => pipe(
    PointRepr.validate(repr, c),
    E.chain(validRepr => io.success(pointFromRepr(validRepr))),
  ),
  (a: Point) => [floatToRepr(a.x), floatToRepr(a.y)],
);

/// ==========
// Circles
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
    E.chain(validRepr => io.success(circleFromRepr(validRepr))),
  ),
  (a: Circle) => [Point.encode(a.p), floatToRepr(a.r)],
);

export function circle(p: Point, r: number): Circle {
  return { kind: 'circle', p, r };
}

function circleFromRepr(repr: CircleRepr): Circle {
  const [p, r] = repr;
  return { kind: 'circle', p: pointFromRepr(p), r: floatFromRepr(r) };
}

/// ==========
// Lines
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
    E.chain(validRepr => io.success(lineFromRepr(validRepr))),
  ),
  (a: Line) => [Point.encode(a.p1), Point.encode(a.p2)],
);

export function line(p1: Point, p2: Point): Line {
  return { kind: 'line', p1, p2 };
}

function lineFromRepr(repr: LineRepr): Line {
  const [p1, p2] = repr;
  return line(pointFromRepr(p1), pointFromRepr(p2));
}


/// ==========
// Triangles
export interface Triangle {
  kind: 'triangle';
  p1: Point;
  p2: Point;
  p3: Point;
}

export const TriangleRepr = io.tuple([PointRepr, PointRepr, PointRepr], 'TriangleRepr');
export type TriangleRepr = io.TypeOf<typeof TriangleRepr>;

function triangleFromRepr(repr: TriangleRepr): Triangle {
  const [p1, p2, p3] = repr;
  return {
    kind: 'triangle', p1: pointFromRepr(p1), p2: pointFromRepr(p2), p3: pointFromRepr(p3),
  };
}

export const Triangle = new io.Type<Triangle, TriangleRepr, unknown>(
  'Triangle', isKind('triangle'),
  (repr: unknown, c: io.Context) => pipe(
    TriangleRepr.validate(repr, c),
    E.chain(validRepr => io.success(triangleFromRepr(validRepr))),
  ),
  (a: Triangle) => [Point.encode(a.p1), Point.encode(a.p2), Point.encode(a.p3)],
);


/// ==========
// Rectangles
export interface Rect {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export const RectRepr = io.tuple([io.number, io.number, io.number, io.number], 'RectRepr');
export type RectRepr = io.TypeOf<typeof RectRepr>;

export function rect(x: number, y: number, width: number, height: number): Rect {
  return {
    kind: 'rect', x, y, width, height
  };
}

export function rectFromRepr(repr: RectRepr): Rect {
  const [x, y, w, h] = repr;
  return rect(
    floatFromRepr(x),
    floatFromRepr(y),
    floatFromRepr(w),
    floatFromRepr(h),
  );
}

export const Rect = new io.Type<Rect, RectRepr, unknown>(
  'Rect', isKind('rect'),
  (u: unknown, c: io.Context) => pipe(
    RectRepr.validate(u, c),
    E.chain(validRepr => io.success(rectFromRepr(validRepr))),
  ),
  (a: Rect) => {
    const {
      x, y, width, height,
    } = a;
    return [
      floatToRepr(x),
      floatToRepr(y),
      floatToRepr(width),
      floatToRepr(height),
    ];
  },
);

/// ==========
// Trapezoids

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

function trapezoid(
  topLeft: Point,
  topWidth: number,
  bottomLeft: Point,
  bottomWidth: number
): Trapezoid {
  return {
    kind: 'trapezoid',
    topLeft,
    topWidth,
    bottomLeft,
    bottomWidth
  };
}

function trapezoidFromRepr(repr: TrapezoidRepr): Trapezoid {
  const [tl, tw, bl, bw] = repr;
  return trapezoid(
    pointFromRepr(tl),
    floatFromRepr(tw),
    pointFromRepr(bl),
    floatFromRepr(bw),
  );
}

export const Trapezoid = new io.Type<Trapezoid, TrapezoidRepr, unknown>(
  'Trapezoid', isKind('trapezoid'),
  (repr: unknown, c: io.Context) => pipe(
    TrapezoidRepr.validate(repr, c),
    E.chain(validRepr => io.success(trapezoidFromRepr(validRepr))),
  ),
  (a: Trapezoid) => [
    Point.encode(a.topLeft), floatToRepr(a.topWidth),
    Point.encode(a.bottomLeft), floatToRepr(a.bottomWidth),
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

/* eslint-enable @typescript-eslint/no-use-before-define */
/* eslint-enable @typescript-eslint/no-redeclare */
