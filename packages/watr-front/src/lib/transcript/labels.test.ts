import _ from 'lodash';
import { isIsomorphic } from '~/lib/codec-utils';

import { Label, LabelRepr, Range, RangeRepr } from './labels';

describe('Label/Range IO', () => {

  const verbose = false;

  it('should I/O Range/Reprs', () => {
    const examples: any[] = [
      { unit: 'shape', at: [123, 234, 345, 456] },
      { unit: 'page', at: 1 },
      { unit: 'shape', at: [[8454, 8483], [52586, 8483]] },
      { unit: 'stanza', at: 0 },
      { unit: 'text:line', at: [1, 2] },
      { unit: 'text:char', at: [1, 2] },
      { unit: 'document', at: 'Doc#23' },
      { unit: 'label', at: 32 },
      { 'unit': 'shape', 'at': [36184, 46472, 1255, 924] },
    ];

    _.each(examples, (example) => {
      expect(isIsomorphic(RangeRepr, example, verbose)).toBe(true);
      expect(isIsomorphic(Range, example, verbose)).toBe(true);
    });
  });

  it('should I/O Labels/Reprs', () => {
    const examples: any[] = [
      { name: 'AnonLabel', range: [] },
      { name: 'AnonLabel', range: [], children: [{ name: 'AnonLabel', range: [] }] },
      { name: 'AnonLabel', range: [{ unit: 'shape', at: [8454, 8483] }] },
      { name: 'IdLabel', id: 21, range: [{ unit: 'page', at: 3 }] },
      { name: 'LabelWithID', id: 22, range: [{ unit: 'text:line', at: [8454, 8483] }] },
      { name: 'LabelWithProps', range: [], props: { key1: ['value'], key2: ['32'] } },
      { 'range': [{ 'unit': 'shape', 'at': [36184, 46472, 1255, 924] }], 'name': 'HorizonRect' },

    ];

    _.each(examples, (example) => {
      expect(isIsomorphic(LabelRepr, example, verbose)).toBe(true);
      expect(isIsomorphic(Label, example, verbose)).toBe(true);
    });
  });

  it('should I/O Nested Labels', () => {
    const examples: any[] = [
      {
        name: 'Authors', range: [{ unit: 'stanza', at: 21 }], children: [
          {
            name: 'Authors', range: [{ unit: 'text:line', at: [0, 2] }], children: [
              {
                name: 'Author', range: [{ unit: 'text:char', at: [0, 20] }], children: [
                  { name: 'FirstName', range: [{ unit: 'text:char', at: [0, 4] }] },
                  { name: 'LastName', range: [{ unit: 'text:char', at: [5, 10] }] },
                ],
              },
            ],
          },
        ],
      },
      {
        'name': 'GlyphGraphNode',
        'range': [
        ],
        'children': [
          {
            'name': 'HorizonRect',
            'range': [
              { 'unit': 'shape', 'at': [10, 20, 30, 40] },
            ],
          },
        ],
      },
    ];

    _.each(examples, (example) => {
      // expect(isIsomorphic(LabelRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Label, example, verbose)).toBe(true);
    });
  });

  it('should fallback to fully validated decoding on error', () => {
    const examples: any[] = [
      { name: 'AnonLabel', ranger: [] },
      { name: 'AnonLabel', range: [], children: [{ name: 'AnonLabel', ranges: [] }] },
      { name: 'IdLabel', id: 21, range: [{ unit: 'pagexx', at: 3 }] },
      // { name: 'AnonLabel', range: [{ unit: 'shape', at: [8454, 8483], }] },
      // { name: 'LabelWithID', id: 22, range: [{ unit: 'text:line', at: [8454, 8483], }] },
      // { name: 'LabelWithProps', range: [], props: { key1: ['value'], key2: ['32'] } },
      // {'range': [{'unit': 'shape', 'at': [36184, 46472, 1255, 924]}], 'name': 'HorizonRect'},

    ];

    _.each(examples, (example) => {
      // expect(isIsomorphic(LabelRepr, example, verbose)).toBe(true)
      expect(isIsomorphic(Label, example, verbose)).toBe(false);
    });
  });

});
