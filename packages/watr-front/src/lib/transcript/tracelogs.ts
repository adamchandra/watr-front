import _ from 'lodash';

import * as io from 'io-ts';
import { Label } from './labels';

const LogHeaders = io.type({
  tags: io.string,
  name: io.string,
  callSite: io.string,
  timestamp: io.number
}, 'LogHeaders');

export type LogHeaders = io.TypeOf<typeof LogHeaders>;
const LogBody = io.union([
  io.array(Label),
  io.array(io.unknown),
], 'LogBody')

const LogEntry = io.type({
  headers: LogHeaders,
  body: LogBody,
  logType: io.string,
  page: io.number
}, 'LogEntry');

export type LogEntry = io.TypeOf<typeof LogEntry>;

export const Tracelog = io.array(LogEntry);
export type Tracelog = io.TypeOf<typeof Tracelog>;

export interface LogEntryGroup {
  groupKey: string;
  logEntries: LogEntry[];
}

export interface LabelGroup {
  groupKey: string;
  labels: Label[];
}

export function groupLabelsByNameAndTags(labels: Label[]): Record<string, Label[]> {
  const grouped = _.groupBy(labels, (label) => {
    const { name, props } = label;
    const allTags = getLabelTags(label);
    const tagKey = allTags.join(' ');
    // const tagKey = props &&  props.tags?  props.tags.join(' ') : '';
    return `${name} ${tagKey}`
  })

  return grouped;
}

function getLabelTags(label: Label): string[] {

  const localTags = label?.props?.['tags'] || [];
  const children = label.children || [];

  const childTags: string[] = _.flatMap(children, c => getLabelTags(c));

  return _.concat(localTags, childTags);
}
