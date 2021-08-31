import _ from 'lodash';

import { Label } from './labels';

import {
  Radix,
  createRadix,
  radUpsert,
} from '@watr/commonlib-shared';

export interface LabelSelection {
  labels: Label[];
  showLabels: boolean[];
  tags: Set<string>;
}
export function createLabelRadix(labels: Label[]): Radix<LabelSelection> {
  const labelRadix = createRadix<LabelSelection>();
  _.each(labels, (label) => {
    const outline = getLabelProp(label, 'outline');
    const { name } = label;
    const path = _.concat([], outline, [name]);
    const ltags = getLabelProp(label, 'tags');
    radUpsert(labelRadix, path, (prevSel) => {
        if (prevSel) {
          prevSel.labels.push(label);
          prevSel.showLabels.push(true);
          ltags.forEach(t => prevSel.tags.add(t));
          return prevSel;
        }
        return {
          labels: [label],
          showLabels: [true],
          tags: new Set<string>(ltags),
        };
    });
  });
  return labelRadix;
}

export function getLabelProp(label: Label, propname: string): string[] {

  const localTags = label?.props?.[propname] || [];
  const children = label.children || [];

  const childTags: string[] = _.flatMap(children, c => getLabelProp(c, propname));

  return _.concat(localTags, childTags);
}
