import _ from 'lodash'
import { prettyPrint } from '@watr/commonlib-shared';
import { makeGlyphReprs } from './gen-testdata';
import { Transcript } from './transcript'
import { isIsomorphic } from '~/lib/codec-utils'


describe('Transcripts', () => {

  const pageTexts = [[
    'H2O I+',
    'eﬃcient'
  ], [
    'Fourscore And',
    'Seven Years'
  ]]

  const page1 = {
    page: 1,
    bounds: [0, 0, 100, 200],
    // text: pageTexts[0],

    glyphs: _.map(pageTexts[0], textLine => makeGlyphReprs(textLine)),

    fonts: [
      [['font-id3', [0, 3]], ['font-id2', [4, 1]], ['font-id0', [5, 1]]]
    ]
  };

  const sampleTranscript = {
    documentId: 'doc-25-id',
    pages: [page1],
    stanzas: [],
    labels: []
  };

  // de-hyphenated text e.g., "in-" "tend" with line break
  //   TODO: should this be handled within glyph class?
  // { // Super/subscript markup 'H_{2}SO_{4}^{+}', // extracted glyphs: "H2SO4+"
  // { // Inset math/chemical formulae/matrix etc.


  it('glyph bounding box PDF overlays', () => {
    // prettyPrint({ page1 })
  });

  it('text substitutions/formatting/escape chars', () => {
  });

  it('links between text sections', () => {
    const bodyGlyphs = [
      4,
      { kind: 'link', ref: 32 },
      5, 6,
      { kind: '/link' },
      7,
    ];
    const referenceGlyphs = [
      { kind: 'anchor/', id: 32 },
      5, 6, 7,
    ];
    // Link body text to reference
    // Link from body text to separate stanza representing inset math
  });
  it('ordering over text/glyphs/shapes', () => {
  });
  it('extracted text with labeled lines/regions', () => {
  });
  it('tracelog shapes', () => {
    // base/top/midline, left/right column points/lines
    const glyphLineLabel = {
      name: 'GlyphLine', range: [{ unit: 'page', at: 3 }], children: [
        {
          name: 'OuterRect', range: [{ unit: 'shape', at: [10, 10, 40, 8] }], children: [
            { name: 'TopLine', range: [{ unit: 'shape', at: [[10, 10], [40, 10]] }] },
            { name: 'MidLine', range: [{ unit: 'shape', at: [[10, 20], [40, 20]] }] },
            { name: 'Glyphs', range: [{ unit: 'text:glyph', at: [23, 24, 12, 34, 22] }] },
          ]
        }
      ]
    };

    const leftColEvidence = {
      name: 'LeftColEvidence', range: [{ unit: 'page', at: 3 }], children: [
        {
          name: 'ColEvidence', range: [
            { unit: 'shape', at: [10, 10] },
            { unit: 'shape', at: [20, 12] },
            { unit: 'shape', at: [30, 14] },
          ]
        },
      ]
    };
  });
  it('hierarchical labels over spans of text (textgrid functionality)', () => {
  });
  it('text reshaped into stanzas with suitable classes for rtree-indexing (textgrid functionality)', () => {
  });
  it('represent zones (clipped region of PDF page with contained text)', () => {
  });

  it('smokescreen', () => {

    const transcriptTemplate = {
      documentId: 'doc-25-id',
      pages: [{
        page: 1,
        bounds: [0, 0, 61200, 79200],
        glyphs: [
          ['I', 1, [19, 94, 9, 10]],
          [' ', 2, [19, 94, 9, 10], { kind: 'ws' }],
          ['2', 3, [19, 94, 9, 10]],
        ],

      }],
      labels: [],
      stanzas: [
        {
          id: 1,
          lines: [
            { text: 'ffi', glyphs: [10, 10, 10] },
            { text: 'see reference ^{[1]}.', glyphs: [1, 2, 3, 4, '^{', 5, 6, 7, '}', 8] },
          ],
          labels: [
            {
              name: 'PageText', range: [{ unit: 'page', at: 1 }], children: [
                { name: 'BodyContent', range: [{ unit: 'text:line', at: [1, 3] }] },
                { name: 'HeaderContent', range: [{ unit: 'text:line', at: [4, 10] }] }
              ]
            }
          ]
        },
      ],
    };

    const verbose = false;
    expect(isIsomorphic(Transcript, transcriptTemplate, verbose)).toBe(true);
  });

});

// {
//   name: 'table',
//   kind: 'schema:table',
//   id: '2',
//   data: {
//     headers: [],
//     records: [{ a: 1, b: 2 }]
//   }
// },
// {
//   kind: 'bibliography',
//   id: '3',
//   lines: [
//     { text: 'Saunders, A.C., etal, WatrWorks ...', glyphIds: [10, 10, 10] },
//   ]
// },
// {
//   name: 'reference',
//   kind: 'text:lines',
//   id: '22',
//   lines: [
//     { text: 'Saunders, A.C., etal, WatrWorks ...', glyphIds: [10, 10, 10] },
//   ]
// },

// {
//   _c1_: { comment: 'represent a bibliography as a labeled set of reference stanzas' },
//   name: 'Bibliography',
//   id: 'L#3',
//   range: [
//     { unit: 'stanza', at: [22, 23, 24] }
//   ]
// },

// labels: [
//   // page-level shapes, ala tracelog labeling
//   {
//     name: 'GlyphLine', range: [{ unit: 'page', at: 1 }], children: [
//       {
//         name: 'OuterRect', range: [{ unit: 'shape', at: [10, 10, 40, 8] }], children: [
//           { name: 'TopLine', range: [{ unit: 'shape', at: [[10, 10], [40, 10]] }] },
//           { name: 'MidLine', range: [{ unit: 'shape', at: [[10, 20], [40, 20]] }] },
//           { name: 'Glyphs', range: [{ unit: 'text:glyph', at: [23, 24, 12, 34, 22] }] },
//         ]
//       }
//     ]
//   }

// ]

// fonts: {
//   scaledFonts: [
//     {
//       declaredName: 'MOOKBM+AdvSPSMI',
//       derivedName: 'MOOKBM+AdvSPSMIx41',
//       id: 0,
//       metrics: {
//         scalingFactor: 41,
//         cap: 0,
//         ascent: 0,
//         midrise: 0,
//         descent: 0,
//         bottom: 0
//       }
//     },
//   ]
// },
