import _ from 'lodash';

import {
  Radix,
  createRadix,
  radUpsert,
  radUnfold,
  radTraverseDepthFirst,
  radFoldUp,
} from '@watr/commonlib-shared';

function foo() {
  const r = createRadix();
}

export function getOrDie<T>(v: T | null | undefined, msg: string = 'null|undef'): T {
  if (v === null || v === undefined) {
    throw new Error(`Error: ${msg}`);
  }
  return v;
}

export function delay(t: number): Promise<unknown> {
  return new Promise(resolve => { setTimeout(resolve, t); });
}

export function newIdGenerator(start: number): () => number {
  let currId = start - 1;
  const nextId = () => {
    currId += 1;
    return currId;
  };
  return nextId;
}
