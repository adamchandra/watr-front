/**
 * Container for a Transcript which provides access to glyphs/stanzas/labels/etc., and
 * maintains a cache of any rtree-indexes, cross-references, ... within the transcript
 *
 * */

import _ from 'lodash';
import RBush from 'rbush';
import { Transcript } from './transcript';
import { Glyph } from '~/lib/transcript/glyph';
import { Rect } from './shapes';
import { LineDimensions } from '../html-text-metrics';
import { newIdGenerator } from '../misc-utils';
import { RTreeIndexable } from '~/components/basics/rtree-search';
import { Label } from './labels';
import { bbox, MinMaxBox } from '../shape-compat';

type RTreeIndexKey = string;

export type RenderStanzaOpts = {
  indexGranularity: 'char' | 'line' | 'none',
  lineBegin?: number,
  lineCount?: number
};

export interface TranscriptIndexable<T> extends RTreeIndexable, MinMaxBox {
  cargo: T;
  // cross-ref for other indexed rects corresponding to this one
  //   e.g., pdf-page glyph vs. stanza text glyph
  indexedRects: Record<RTreeIndexKey, Rect>;

  // key for the cached index in which this indexable appears
  primaryKey: RTreeIndexKey;

  // The bounding rect for this indexable in the rtree specified by the primary key
  primaryRect: Rect;
}

export class TranscriptIndex {
  transcript: Transcript;

  indexes: Record<RTreeIndexKey, RBush<TranscriptIndexable<any>>>;

  indexables: Record<string, TranscriptIndexable<any>>;

  nextId: () => number;

  constructor(t: Transcript) {
    this.transcript = t;
    this.indexes = {};
    this.indexables = {};
    this.initPageRTrees(); // TODO on/off switch for this for performance reasons
    this.initIndexables(); // TODO on/off switch for this for performance reasons
    this.nextId = newIdGenerator(1);
  }

  initPageRTrees(): void {
    const { pages } = this.transcript;
    _.each(pages, (page, pageNumber) => {
      _.each(page.labels, l => l.range.unshift({ unit: 'page', at: pageNumber }));
      const primaryKey = `page#${page.page}/glyphs`;
      const rtree = new RBush<TranscriptIndexable<Glyph>>();
      this.indexes[primaryKey] = rtree;
    });
  }

  initIndexables(): void {
    const { pages } = this.transcript;
    _.each(pages, (page, pageNumber) => {
      _.each(page.labels, l => l.range.unshift({ unit: 'page', at: pageNumber }));

      const primaryKey = `page#${page.page}/glyphs`;
      const pageIndexables = _.map(page.glyphs, (glyph) => {
        const {
          x, y, width, height,
        } = glyph.rect;
        const charBounds = bbox(x, y, width, height);
        const {
          minX, minY, maxX, maxY,
        } = charBounds;
        const indexedRects: Record<RTreeIndexKey, Rect> = {};
        indexedRects[primaryKey] = glyph.rect;
        const glyphOverlay: TranscriptIndexable<Glyph> = {
          cargo: glyph,
          primaryKey,
          primaryRect: glyph.rect,
          indexedRects,
          id: glyph.id.toString(),
          minX,
          minY,
          maxX,
          maxY,
        };

        this.indexables[glyphOverlay.id] = glyphOverlay;
        return glyphOverlay;
      });

      const rtree = this.indexes[primaryKey];
      rtree.load(pageIndexables);
    });
  }

  public getLabels(labelNames: string[], pageNumber?: number): Label[] {
    const { pages } = this.transcript;
    const pageNs = pageNumber === undefined ? pages : [pages[pageNumber]];
    const labels = _.flatMap(pageNs, p => p.labels);

    const matchingLabels: Label[] = _.filter(labels, l => {
      const hasName = labelNames.length === 0 || labelNames.includes(l.name);
      return hasName;
    });
    return matchingLabels;
  }

  public indexStanza(
    stanzaIndex: number,
    putTextLn: PutTextLn,
    opts: RenderStanzaOpts,
  ): Rect {
    const { lineBegin, lineCount } = opts;
    const stanza = this.transcript.stanzas[stanzaIndex];

    const lbegin = lineBegin === undefined ? 0 : lineBegin;
    const lend = lineCount === undefined ? stanza.lines.length : lbegin + lineCount;

    const primaryKey = `stanza#${stanzaIndex}`;
    const rtree = new RBush<TranscriptIndexable<string | number>>();
    this.indexes[primaryKey] = rtree;
    let maxWidth = 0;
    let totalHeight = 0;
    _.each(stanza.lines, (line, lineNum) => {
      const lineInRange = lbegin <= lineNum && lineNum < lend;
      if (!lineInRange) return;

      const lineDimensions = putTextLn(lineNum, line.text);
      maxWidth = Math.max(maxWidth, lineDimensions.width);
      totalHeight += lineDimensions.height;

      const lineIndexables = _.map(line.glyphs, (glyphRef, i) => {
        const charDim = lineDimensions.charBounds[i];
        const {
          x, y, width, height,
        } = charDim;
        const charBounds = bbox(x, y, width, height);
        const {
          minX, minY, maxX, maxY,
        } = charBounds;

        if (_.isNumber(glyphRef)) {
          const pageGlyph = this.indexables[glyphRef];
          pageGlyph.indexedRects[primaryKey] = charDim;
          const stanzaIndexable: TranscriptIndexable<number> = {
            cargo: glyphRef,
            primaryKey,
            primaryRect: charDim,
            indexedRects: pageGlyph.indexedRects,
            id: glyphRef.toString(),
            minX,
            minY,
            maxX,
            maxY,
          };
          return stanzaIndexable;
        }
        const stanzaIndexable: TranscriptIndexable<string> = {
          cargo: glyphRef,
          primaryKey,
          primaryRect: charDim,
          indexedRects: {},
          id: (-this.nextId()).toString(),
          minX,
          minY,
          maxX,
          maxY,
        };
        return stanzaIndexable;
      });
      rtree.load(lineIndexables);
    });

    return {
      kind: 'rect',
      x: 0,
      y: 0,
      width: maxWidth,
      height: totalHeight,
    };
  }

  public newKeyedIndex<T>(key: string) {
    const rtree = new RBush<TranscriptIndexable<T>>();
    this.indexes[key] = rtree;
  }

  public getKeyedIndex(key: string) {
    return this.indexes[key];
  }
}

export type PutTextLn = (lineNum: number, text: string) => LineDimensions;
