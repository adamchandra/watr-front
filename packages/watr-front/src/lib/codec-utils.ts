
import _ from 'lodash';
import * as io from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { prettyPrint } from '@watr/commonlib-shared';

interface Positive {
  readonly Positive: unique symbol;
}

interface NonNegative {
  readonly NonNegative: unique symbol;
}

export const Positive = io.brand(
  io.number,
  (n: number): n is io.Branded<number, Positive> => n > 0,
  'Positive',
);

export const NonNegative = io.brand(
  io.number,
  (n: number): n is io.Branded<number, NonNegative> => n >= 0,
  'NonNegative',
);


export const PositiveInt = io.intersection([io.Int, Positive]);
export type PositiveInt = io.TypeOf<typeof PositiveInt>;

export const NonNegativeInt = io.intersection([io.Int, NonNegative]);
export type NonNegativeInt = io.TypeOf<typeof NonNegativeInt>;

// export const Begin = NonNegativeInt;
const Begin = io.number;
export type Begin = io.TypeOf<typeof Begin>;

// const Length = NonNegativeInt;
const Length = io.number;
type Length = io.TypeOf<typeof Length>;

// export type Span = [Begin, Length];
export const Span = io.tuple([Begin, Length], 'Span');
export type Span = io.TypeOf<typeof Span>;

// export const PageNumber = PositiveInteger;
export const PageNumber = io.number;

export function isIsomorphic<A, IO>(ioType: io.Type<A, IO, IO>, input: IO, verbose: boolean = false): boolean {
  const maybeDecoded = ioType.decode(input);
  if (isLeft(maybeDecoded)) {
    const report = PathReporter.report(maybeDecoded);
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/decode === false`, input, report });
    }
    return false;
  }

  const decoded = maybeDecoded.right;
  if (verbose) {
    prettyPrint({ m: `(1) decode-success: isIsomorphic(${ioType.name})/decode === true`, decoded });
  }
  const reEncoded = ioType.encode(decoded);
  if (!_.isEqual(input, reEncoded)) {
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/re-encode === false`, input, decoded, reEncoded });
    }
    return false;
  }

  if (verbose) {
    prettyPrint({ m: `(2) encode-success: isIsomorphic(${ioType.name})/decode === true`, reEncoded });
  }

  const maybeReDecoded = ioType.decode(reEncoded);
  if (isLeft(maybeReDecoded)) {
    const report = PathReporter.report(maybeReDecoded);
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/re-decode === false`, report, input, reEncoded });
    }
    return false;
  }
  if (verbose) {
    console.log('isIsomorphic: decoded 3');
  }

  const reDecoded = maybeReDecoded.right;

  if (!_.isEqual(decoded, reDecoded)) {
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/re-decode === false`, input, decoded, reDecoded });
    }
    return false;
  }
  if (verbose) {
    console.log('isIsomorphic: decoded 3');
  }

  if (verbose) {
    prettyPrint({ m: `isIsomorphic(${ioType.name}) === true`, input, decoded, reEncoded, reDecoded });
  }

  return true;
}
/*

      "children": [{
        "children": [{
          "props": {"class": ["=hover", "=trigger"]},
          "range": [{"unit": "shape", "at": [36694, 45276, 1465, 924]}],
          "name": "FocalRect"
        }, {
          "range": [{"unit": "shape", "at": [36694, 45276, 1465, 80324]}],
          "name": "HorizonRect"
        }, {
          "children": [{
            "range": [{"unit": "shape", "at": [36694, 46201, 1465, 79399]}],
            "name": "Search/Cell:Bottom"
          }],
          "range": [],
          "name": "SearchArea"
        }],
        "range": [],
        "name": "Octothorpe"
      }, {
        "children": [{
          "range": [{"unit": "shape", "at": [36184, 46472, 1255, 924]}],
          "id": 58041,
          "name": "GlyphBigram"
        }, {
          "range": [{"unit": "shape", "at": [37884, 46472, 493, 924]}],
          "id": 58044,
          "name": "GlyphBigram"
        }],
        "range": [],
        "name": "Found"
      }],




*/
