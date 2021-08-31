import _ from 'lodash';
import { prettyPrint } from './pretty-print';

import {
  createRadix,
  radUpsert,
  radInsert,
  radTraverseDepthFirst,
  radUnfold,
  radFoldUp,
  Radix
} from './radix-tree';

function expectKeyVals<T>(rad: Radix<T>, expected: [string, T | undefined][]) {
  const unfolded = radUnfold(rad, (path, maybeVal) => {
    return [
      path.join('.'),
      maybeVal
    ];
  });
  expect(unfolded).toStrictEqual(expected);
}

interface Foo {
  s: string;
  i: number;
}

function foo(n: number): Foo {
  return {
    s: `hey#${n}`,
    i: n
  };
}

describe('Radix Tree Tests', () => {
  it('should create a tree', () => {
    const radTree = createRadix<Foo>();

    radInsert(radTree, 'a.$', foo(25));

    expectKeyVals(radTree, [
      ['', undefined],
      ['a', undefined],
      ['a.$', foo(25)],
    ]);


    radInsert(radTree, 'a.$.12._$.b', foo(26));

    expectKeyVals(radTree, [
      ['', undefined],
      ['a', undefined],
      ['a.$', foo(25)],
      ['a.$.12', undefined],
      ['a.$.12._$', undefined],
      ['a.$.12._$.b', foo(26)],
    ]);

    radUpsert(radTree, 'a.$.12._$.b', prev => {
      return prev ? foo(20) : foo(21);
    });

    expectKeyVals(radTree, [
      ['', undefined],
      ['a', undefined],
      ['a.$', foo(25)],
      ['a.$.12', undefined],
      ['a.$.12._$', undefined],
      ['a.$.12._$.b', foo(20)],
    ]);

    radUpsert(radTree, 'a.$.12._$.q', prev => {
      return prev ? foo(20) : foo(21);
    });

    expectKeyVals(radTree, [
      ['', undefined],
      ['a', undefined],
      ['a.$', foo(25)],
      ['a.$.12', undefined],
      ['a.$.12._$', undefined],
      ['a.$.12._$.b', foo(20)],
      ['a.$.12._$.q', foo(21)],
    ]);
  });

  it('should traverse all paths depth first', () => {
    const radTree = createRadix<Foo>();

    radInsert(radTree, 'a.b', { s: 'ab-val', i: 123 });
    radInsert(radTree, 'd.e.f', { s: 'def-val', i: 345 });

    radTraverseDepthFirst(radTree, (path, maybeVal) => {
      prettyPrint({ path, maybeVal });
    });

  });

  it('should unfold all paths', () => {
    const radTree = createRadix<Foo>();

    radInsert(radTree, 'a.b', { s: 'ab-val', i: 123 });
    radInsert(radTree, 'd.e.f', { s: 'def-val', i: 345 });

    const unfolded = radUnfold(radTree, (path, maybeVal) => {
      return [
        path.join(''),
        maybeVal !== undefined
      ];
    });
    const expected = [
      ['', false],
      ['a', false],
      ['ab', true],
      ['d', false],
      ['de', false],
      ['def', true],
    ];

    expect(unfolded).toStrictEqual(expected);

  });


  it('should foldUp', () => {
    const radTree = createRadix<Foo>();

    radInsert(radTree, 'a', { s: 'd0', i: 123 });
    radInsert(radTree, 'a.b.c', { s: 'd1', i: 345 });
    radInsert(radTree, 'a.d.e', { s: 'd1', i: 345 });

    const foldedResult = radFoldUp(radTree, (path, { nodeData, childResults, index }) => {

      const d = nodeData ? '!' : '';
      const ch = childResults.length > 0 ? `(${childResults.join(', ')})` : '';
      const self = path.length > 0 ? path.join('/') : 'root= ';
      return `${self}#${index}${d}${ch}`;
    })
    const expected = 'root= #5(a#4!(a/b/c#2!, a/b#3(a/d#1(a/d/e#0!))))'
    expect(foldedResult).toStrictEqual(expected);

  });

  interface DisplayData {
    displayableChildCount: number;
    displayableSelfCount: number;
    displayItems?: string[];
  }

  function displayData(items: string[]): DisplayData {
    return {
      displayableChildCount: 0,
      displayableSelfCount: items.length,
      displayItems: items
    };
  }

  it('should represent a displayable item tree', () => {
    const radTree = createRadix<DisplayData>();
  });

});
