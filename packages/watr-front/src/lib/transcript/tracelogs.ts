import _ from 'lodash';

import { Label } from './labels';

import Bitset from 'bitset';

import {
  Radix,
  createRadix,
  radUpsert,
  radTraverseDepthFirst,
} from '@watr/commonlib-shared';

interface Node {
  selfDisplayableCount: number;
  childDisplayableCount: number;
}

export interface DataNode<D> extends Node {
  readonly kind: 'DataNode';
  data: D;
}
export interface EmptyNode extends Node {
  readonly kind: 'EmptyNode';
}

export type NodeLabel<D> = EmptyNode | DataNode<D>;

export interface LabelInfo {
  labels: Label[];
  // showLabels: boolean[]; // TODO replace w/bitset if performance is an issue
  showLabels: Bitset;
  tags: Set<string>;
}

export type LabelSelection = EmptyNode | DataNode<LabelInfo>;

export function createLabelRadix(labels: Label[]): Radix<LabelSelection> {
  const labelRadix = createRadix<LabelSelection>();
  _.each(labels, (label) => {
    const outline = getLabelProp(label, 'outline');
    const ltags = getLabelProp(label, 'tags');

    radUpsert<LabelSelection>(labelRadix, outline, (prevSel?: LabelSelection) => {
      if (prevSel === undefined) {
        return {
          kind: 'DataNode',
          data: {
            labels: [label],
            showLabels: new Bitset,
            tags: new Set<string>(ltags),
          },
          selfDisplayableCount: 0,
          childDisplayableCount: 0
        };

      }
      if (prevSel.kind === 'EmptyNode') {
        return {
          kind: 'DataNode',
          data: {
            labels: [label],
            showLabels: new Bitset,
            tags: new Set<string>(ltags),
          },
          selfDisplayableCount: labels.length,
          childDisplayableCount: prevSel.childDisplayableCount
        };
      }
      prevSel.data.labels.push(label);
      ltags.forEach(t => prevSel.data.tags.add(t));
      return prevSel;
    });
  });

  radTraverseDepthFirst<LabelSelection>(labelRadix, (path, data, childCount, node) => {
    if (data === undefined) {
      console.log(`setting empty path`, path);
      node.data = {
        kind: 'EmptyNode',
        selfDisplayableCount: 0,
        childDisplayableCount: 0
      };
    }
  });

  // const { name } = label;
  // const path = _.concat([], outline, [name]);
  return labelRadix;
}

export function getLabelProp(label: Label, propname: string): string[] {

  const localTags = label?.props?.[propname] || [];
  const children = label.children || [];

  const childTags: string[] = _.flatMap(children, c => getLabelProp(c, propname));

  return _.concat(localTags, childTags);
}
