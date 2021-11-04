import _ from 'lodash';

export function getOrDie<T>(v: T | null | undefined, msg: string = 'null|undef'): T {
  if (v === null || v === undefined) {
    throw new Error(`Error: ${msg}`);
  }
  return v;
}

export function delay(t: number): Promise<number> {
  return new Promise(resolve => setTimeout(resolve, t));
}

export function newIdGenerator(start: number): () => number {
  let currId = start - 1;
  const nextId = () => {
    currId += 1;
    return currId;
  };
  return nextId;
}
