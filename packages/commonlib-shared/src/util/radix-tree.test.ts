import _ from 'lodash';
import { prettyPrint } from './pretty-print';

import {
  createRadix,
  radUpsert,
  radInsert,
  radTraverseValues,
  radTraverseDepthFirst,
  radUnfold,
  radFoldUp,
} from './radix-tree';

describe('Radix Tree Tests', () => {
  interface Foo {
    s: string;
    i: number;
  }

  it('should create a tree', () => {
    const radTree = createRadix<Foo>();

    expect(radTree).toMatchObject({});

    radInsert(radTree, 'a.$.12._$.b', { s: 'hey', i: 25 });

    expect(radTree).toMatchObject({
      a: { $: { _12: { __$: { b: { _$: { i: 25, s: 'hey' } } } } } },
    });

    radUpsert(radTree, 'a.$.12._$.b', prev => {
      return prev ? _.merge({}, prev, { s: 'hey yourself' })
        : { i: 42, s: 'hey yourself' }
        ;
    });

    expect(radTree).toMatchObject({
      a: {
        $: { _12: { __$: { b: { _$: { i: 25, s: 'hey yourself' } } } } },
      },
    });

    radUpsert(radTree, 'a.blah.b', prev => {
      return prev ? _.merge({}, prev, { s: 'child data' })
        : { i: 103, s: 'new blah data' }
        ;
    });

    expect(radTree).toMatchObject({
      a: {
        $: { _12: { __$: { b: { _$: { i: 25, s: 'hey yourself' } } } } },
        blah: { b: { _$: { i: 103, s: 'new blah data' } } },
      },
    });
  });

  it('should traverse the tree', () => {
    const nodes: Array<[string, Foo]> = [
      ['', { s: 'zero', i: 0 }],
      ['a', { s: 'a-str', i: 99 }],
      ['a.b', { s: 'one', i: 1 }],
      ['a.00.$', { s: 'two', i: 2 }],
      ['a.00.d', { s: 'three', i: 3 }],
    ];
    const expectedTree = {
      '_$': { s: 'zero', i: 0 },
      a: {
        '_$': { s: 'a-str', i: 99 },
        b: { '_$': { s: 'one', i: 1 } },
        _00: {
          '$': { '_$': { s: 'two', i: 2 } },
          d: { '_$': { s: 'three', i: 3 } }
        }
      }
    };

    const o = {};

    _.each(nodes, ([p, d]) => radInsert(o, p, d));

    expect(o).toStrictEqual(expectedTree);

    radTraverseValues(o, (path, tval) => {
      const pathVal = _.get(o, _.concat(path, ['_$']));
      expect(pathVal).toStrictEqual(tval);
    });
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
    ]

    expect(unfolded).toStrictEqual(expected);

  });


  it('should foldRight', () => {
    const radTree = createRadix<Foo>();

    radInsert(radTree, 'a', { s: 'd0', i: 123 });
    radInsert(radTree, 'a.b.c', { s: 'd1', i: 345 });
    radInsert(radTree, 'a.d.e', { s: 'd1', i: 345 });

    const foldedResult = radFoldUp(radTree, (path, { nodeData, childResults, index}) => {

      const d = nodeData? '!' : '';
      const ch = childResults.length > 0? `(${childResults.join(', ')})`: '';
      const self = path.length > 0? path.join('/') : 'root= ';
      return `${self}#${index}${d}${ch}`;
    })
    const expected = 'root= #5(a#4!(a/b/c#2!, a/b#3(a/d#1(a/d/e#0!))))'
    expect(foldedResult).toStrictEqual(expected);
  });

});
