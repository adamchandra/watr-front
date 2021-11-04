import _ from 'lodash';

import * as Diff from 'diff';
import Crypto from 'crypto-js';

import * as Js from 'fp-ts/Json';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

export function shaEncodeAsHex(str: string): string {
  const cryptoSha = Crypto.SHA1(str);
  return cryptoSha.toString();
}

export function stripMargin(block: string): string {
  const lines = block.split('\n');
  const stripped = stripMargins(lines);
  return stripped.join('\n');
}

export function stripMargins(lines: string[]): string[] {
  return _
    .map(lines, l => {
      if (/^ *\|/.test(l)) {
        return l.slice(l.indexOf('|') + 1);
      }
      return l;
    });
}

export function parseJsonStripMargin(s: string): any | undefined {
  const s0 = stripMargin(s);
  return parseJson(s0);
}

export function parseJson(s: string): any | undefined {
  return pipe(
    Js.parse(s),
    E.mapLeft((syntaxError: Error) => {
      console.log(`Parsing Error: ${syntaxError}`);

      const posRE = /position (\d+)/;
      const posMatch = syntaxError.message.match(posRE);

      if (posMatch && posMatch.length > 1) {
        const errIndex = Number.parseInt(posMatch[1], 10);
        const begin = Math.max(0, errIndex - 50);
        const end = Math.min(s.length, errIndex + 50);
        const pre = s.slice(begin, errIndex + 1);
        const post = s.slice(errIndex + 1, end);
        console.log(`${syntaxError}\nContext:\n${pre} <-- Error\n${post}`);
      }
    }),
  );
}

type DiffCharsArgs = {
  brief: boolean
};

export interface AddChange {
  kind: 'add';
  value: string;
  count: number;
}
export interface RemoveChange {
  kind: 'remove';
  value: string;
  count: number;
}

export interface Unchanged {
  kind: 'unchanged';
  value?: string;
  count: number;
}
export type Change = AddChange | RemoveChange | Unchanged;

export function isAdd(c: Change): c is AddChange {
  return c.kind === 'add';
}
export function isRemove(c: Change): c is AddChange {
  return c.kind === 'remove';
}
export function isUnchanged(c: Change): c is AddChange {
  return c.kind === 'unchanged';
}

export function diffByChars(stra: string, strb: string, opts?: DiffCharsArgs): Change[] {
  const brief = opts && opts.brief;
  const changes = Diff.diffChars(stra, strb);
  const asPairs = _.map(changes, (change) => _.toPairs(change));
  const filterUndefs = _.map(asPairs, change => _.filter(change, ([, v]) => !_.isNil(v)));
  const asObjects = _.map(filterUndefs, change => Object.fromEntries(change));
  return _.map(asObjects, obj => {
    const {
      added, removed, count, value,
    } = obj;
    if (added) return ({ kind: 'add', value, count });
    if (removed) return ({ kind: 'remove', value, count });
    if (brief) return ({ kind: 'unchanged', count });
    return ({ kind: 'unchanged', value, count });
  });
}
