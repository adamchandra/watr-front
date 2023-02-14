import _ from 'lodash';

import * as io from 'io-ts';
import { Rect } from './shapes';
import { NonNegativeInt } from '~/lib/codec-utils';
import { Glyph } from './glyph';
import { Label } from './labels';

export const GlyphRef = io.union([
  io.Int,
  io.string,
], 'GlyphRef');

export const Line = io.strict({
  text: io.string,
  glyphs: io.array(GlyphRef),
}, 'Line');

export type Line = io.TypeOf<typeof Line>;

export const Page = io.strict({
  page: NonNegativeInt,
  bounds: Rect,
  glyphs: io.array(Glyph),
  labels: io.array(Label),
}, 'Page');

export type Page = io.TypeOf<typeof Page>;

export const Stanza = io.strict({
  id: NonNegativeInt,
  lines: io.array(Line),
  labels: io.array(Label),
}, 'Stanza');

export const BuildInfo = io.type({
  appName: io.string,
  appVersion: io.string,
  gitCurrentBranch: io.string,
  gitHeadCommit: io.string,
  scalaVersion: io.string,
}, 'BuildInfo');

export const Transcript = io.type({
  documentId: io.string,
  pages: io.array(Page),
  stanzas: io.array(Stanza),
  labels: io.array(Label),
  // buildInfo: BuildInfo,
}, 'Transcript');

export type Transcript = io.TypeOf<typeof Transcript>;
