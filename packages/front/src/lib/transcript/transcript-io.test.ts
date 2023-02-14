import _ from 'lodash';
import fs from 'fs-extra';
import { Stanza, Transcript } from './transcript';
import { isIsomorphic } from '~/lib/codec-utils';

describe('Transcript/Stanza IO', () => {
  const verbose = false;

  it('should I/O Stanzas', () => {
    const examples = [
      {
        id: 1,
        // schema: 'TextLines',
        lines: [
          { text: 'ffi', glyphs: [10, 10, 10] },
          { text: 'see reference ^{[1]}.', glyphs: [1, 2, 3, 4, '^{', 5, 6, 7, '}', 8] },
        ],
        labels: [
          {
            name: 'PageText',
            range: [{ unit: 'page', at: 1 }],
            children: [
              { name: 'BodyContent', range: [{ unit: 'text:line', at: [1, 3] }] },
              { name: 'HeaderContent', range: [{ unit: 'text:line', at: [4, 10] }] },
            ],
          },
        ],
      },
    ];

    _.each(examples, example => {
      expect(isIsomorphic(Stanza, example, verbose)).toBe(true);
    });
  });

  it('should I/O Transcript', () => {
    const example = fs.readJsonSync('./dev-data/transcriptions/sample-transcription.json');
    // isIsomorphic(Transcript, example, true)
    expect(isIsomorphic(Transcript, example, verbose)).toBe(true);
  });
});
