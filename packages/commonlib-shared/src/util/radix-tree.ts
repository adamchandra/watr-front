import _ from 'lodash';
import { prettyPrint } from './pretty-print';

export type Radix<T> = { [s: string]: Radix<T> | T };
export type RadixPath = string[];

const RadixValKey = '_$';

export const createRadix = <T>(): Radix<T> => ({} as Radix<T>);

function cleanPath(p: string | string[]): string[] {
  let pathParts: string[];
  if (typeof p === 'string') {
    pathParts = p.split('.');
  } else {
    pathParts = p;
  }
  return _.map(pathParts, pp => {
    const part = pp.trim();
    if (/^(\d+|_[$])$/.test(part)) {
      return `_${part}`;
    }
    return part;
  }).filter(p => p.length > 0);
}


export const radUpsert = <T>(
  radix: Radix<T>,
  path: string | string[],
  f: (t?: T) => T,
): void => {
  const valpath = _.concat(cleanPath(path), [RadixValKey])
  const prior = _.get(radix, valpath);
  const upVal = f(prior);
  _.set(radix, valpath, upVal);
};

export const radUpsertOrGraft = <T>(
  radix: Radix<T>,
  path: string | string[],
  f: (t?: T) => T | Radix<T>,
): void => {
  const valpath = _.concat(cleanPath(path), [RadixValKey])
  const prior = _.get(radix, valpath);
  const upVal = f(prior);
  _.set(radix, valpath, upVal);
};



export const radInsert = <T>(radix: Radix<T>, path: string | string[], t: T): void =>
  radUpsert(radix, path, () => t);

export const radGet = <T>(
  radix: Radix<T>,
  path: string | string[],
): T | undefined => {
  const valpath = _.concat(cleanPath(path), [RadixValKey])
  const v: T | undefined = _.get(radix, valpath);
  return v;
};


export const radTraverseDepthFirst = <T>(
  radix: Radix<T>,
  f: (path: RadixPath, t?: T, childCount?: number) => void,
): void => {
  function _loop(rad: Radix<T>, lpath: string[]) {
    const kvs = _.toPairs(rad);
    const childKVs = kvs.filter(([k,]) => k !== RadixValKey);


    const valueEntry = kvs.find(([k,]) => k === RadixValKey);
    if (valueEntry === undefined) {
      f(lpath, undefined, childKVs.length)
    } else {
      f(lpath, valueEntry[1] as T, childKVs.length)
    }

    _.each(childKVs, ([k, v]) => {
      const newpath = _.concat(lpath, k);
      _loop(v as Radix<T>, newpath);
    });
  }
  _loop(radix, []);
};

export const radTraverseValues = <T>(
  radix: Radix<T>,
  f: (path: RadixPath, t: T) => void,
): void => radTraverseDepthFirst(radix, (path, maybeT) => {
  if (maybeT === undefined) return;
  f(path, maybeT);
});


export const radUnfold = <T, U>(
  radix: Radix<T>,
  f: (path: RadixPath, t?: T) => U | undefined,
): Array<U> => {
  const res: U[] = [];
  radTraverseDepthFirst(radix, (path, maybeT, childCount) => {
    const u = f(path, maybeT);
    if (u !== undefined) {
      res.push(u);
    }
  });

  return res;
};

export interface FoldArgs<T, U> {
  index: number;
  nodeData?: T;
  childResults: U[];
}

export const radFoldUp = <T, U>(
  radix: Radix<T>,
  // f: (path: RadixPath, t: T | undefined, childRes: U[]) => U,
  f: (path: RadixPath, args: FoldArgs<T, U>) => U,
): U => {
  const rstack: [string[], T | undefined, number][] = [];

  radTraverseDepthFirst(radix, (path, maybeT, childCount) => {
    rstack.push([path, maybeT, childCount]);
  });

  const ustack: U[] = [];
  let index = 0;
  while (rstack.length > 0) {
    const [ipath, nodeData, ichildCount] = rstack.pop();
    const childResults = ustack.splice(0, ichildCount);
    const ures = f(ipath, { nodeData, index, childResults });
    ustack.push(ures);
    index += 1;
    // prettyPrint({ rstack, ustack, uargs, ures, ipath, ival, ichildCount })
  }

  return ustack[0];
};
