import _ from 'lodash';

import { Label } from './labels';

// import * as io from 'io-ts';
// const LogHeaders = io.type({
//   tags: io.string,
//   name: io.string,
//   callSite: io.string,
//   timestamp: io.number
// }, 'LogHeaders');

// export type LogHeaders = io.TypeOf<typeof LogHeaders>;
// const LogBody = io.union([
//   io.array(Label),
//   io.array(io.unknown),
// ], 'LogBody')

// const LogEntry = io.type({
//   headers: LogHeaders,
//   body: LogBody,
//   logType: io.string,
//   page: io.number
// }, 'LogEntry');

// export type LogEntry = io.TypeOf<typeof LogEntry>;

// export const Tracelog = io.array(LogEntry);
// export type Tracelog = io.TypeOf<typeof Tracelog>;

// export interface LogEntryGroup {
//   groupKey: string;
//   logEntries: LogEntry[];
// }

// export interface LabelGroup {
//   groupKey: string;
//   labels: Label[];
// }

// outline -> tags -> label[]
export function groupLabelsByNameAndTags(labels: Label[]): Map<string, Map<string, Label[]>> {
  const outlineMap = new Map();
  _.each(labels, (label) => {
    const outline = getLabelProp(label, 'outline');
    const tags = getLabelProp(label, 'tags');
    const tagKey = tags.join(' ');
    const outlineKey = outline.join(' ');
    let innerMap: Map<string, Label[]> = outlineMap.get(outlineKey);
    if (innerMap === undefined) {
      innerMap = new Map();
      outlineMap.set(outlineKey, innerMap);
    }
    let labelArr: Label[] = innerMap.get(tagKey);
    if (labelArr === undefined) {
      labelArr = [];
      innerMap.set(tagKey, labelArr)
    }
    labelArr.unshift(label);
  });

  return outlineMap;
}


export function groupLabelsByNameAndTagsold(labels: Label[]): Record<string, Label[]> {
  const grouped = _.groupBy(labels, (label) => {
    const { name } = label;
    const outline = getLabelProp(label, 'outline');
    const tags = getLabelProp(label, 'tags');
    const outlineKey = outline.join(' ');
    return `${outlineKey} : ${name}`
  })

  return grouped;
}

function getLabelProp(label: Label, propname: string): string[] {

  const localTags = label?.props?.[propname] || [];
  const children = label.children || [];

  const childTags: string[] = _.flatMap(children, c => getLabelProp(c, propname));

  return _.concat(localTags, childTags);
}
