import _ from 'lodash';

import { ref, watch, Ref, defineComponent, inject, SetupContext, shallowRef } from '@nuxtjs/composition-api';

import Bitset from 'bitset';


import {
  radFoldUp,
  Radix,
  radTraverseValues,
  radUnfold
} from '@watr/commonlib-shared';

export const ProvidedChoices = 'ProvidedChoices';

export interface NarrowingChoice<T> {
  index: number;
  count: number;
  indent: string;
  display: string;
  tags: string[];
  value: T;
}

import { getLabelProp, LabelSelection } from '~/lib/transcript/tracelogs';
import { Label } from '~/lib/transcript/labels';

export default defineComponent({
  setup(_props, ctx: SetupContext) {
    const { emit } = ctx;

    const currSelectionRef = ref([] as NarrowingChoice<unknown>[])
    const queryTextRef = ref('');

    const choicesRef: Ref<Radix<LabelSelection> | null> = inject(ProvidedChoices, shallowRef(null));

    const onSubmit = () => {
      emit('items-selected', []);
    };

    const onReset = () => {
      queryTextRef.value = '';
      emit('items-reset');
    };

    watch(choicesRef, (choices) => {
      if (choices === null) return;

      const finalChoices = labelRadToDisplayables(choices, '')
      currSelectionRef.value = finalChoices;

      const updateSelection = (query: string) => {
        currSelectionRef.value = labelRadToDisplayables(choices, query);
      }
      const debounced = _.debounce(updateSelection, 300);

      watch(queryTextRef, (queryText) => {
        debounced(queryText);
      });

    });

    return {
      choicesRef,
      currSelectionRef,
      queryTextRef,
      onSubmit,
      onReset,
    };

  }
});

function labelRadToDisplayables(
  labelRadix: Radix<LabelSelection>,
  query: string
): Array<NarrowingChoice<Label[]>> {

  const terms = query.trim().split(/[ ]+/g).map(t => t.toLowerCase());
  const showAll = terms.length === 0;
  radFoldUp<LabelSelection, number>(labelRadix, (path, { nodeData, childResults }) => {
    const childShowableCount = _.sum(_.concat(childResults, 0));
    nodeData.childDisplayableCount = childShowableCount;

    if (nodeData.kind === 'EmptyNode') {
      return nodeData.childDisplayableCount;
    }

    const { labels, showLabels } = nodeData.data;
    const pathLC = path.map(s => s.toLowerCase());
    if (showAll) {
      showLabels.setRange(0, labels.length, 1);
    } else {
      // showLabels.setRange(0, labels.length, 0);
      _.each(labels, (l, i) => {
        const tags = getLabelProp(l, 'tags').map(s => s.toLowerCase());
        const tagMatch = _.some(terms, term => _.some(tags, tag => tag.includes(term)));
        const pathMatch = _.some(terms, term => _.some(pathLC, pseg => pseg.includes(term)));
        const setBit = tagMatch || pathMatch ? 1 : 0;
        nodeData.data.showLabels.set(i, setBit);
      });
    }

    nodeData.selfDisplayableCount = nodeData.data.showLabels.cardinality()

    return nodeData.childDisplayableCount + nodeData.selfDisplayableCount
  });


  const unfolded: NarrowingChoice<Label[]>[] = radUnfold(labelRadix, (path, labelSelection) => {
    if (path.length === 0) {
      return undefined;
    }
    if (labelSelection === undefined) return undefined;

    const childC = labelSelection.childDisplayableCount;
    const selfC = labelSelection.selfDisplayableCount;
    if (childC + selfC === 0) {
      return undefined;
    }

    const outlineHeader = _.last(path);
    if (labelSelection.kind === 'DataNode') {
      const { labels, showLabels, tags } = labelSelection.data;
      const tagDisplay = labelSelection ? Array.from(tags) : [];
      // const labels = labelSelection ? labelSelection.data.labels : [];
      // labelSelection.data.labels.filter((l, li) =>  )
      const showables = labels.filter((_l, i) => showLabels.get(i) !== 0);

      return {
        index: 0,
        indent: `pl-${(path.length - 1) * 3}`,
        display: outlineHeader,
        value: showables,
        count: showables.length,
        tags: tagDisplay
      };
    }
    return {
      index: 0,
      indent: `pl-${(path.length - 1) * 3}`,
      display: outlineHeader,
      value: undefined,
      count: 0,
      tags: []
    };
  });
  const finalChoices = _.filter(unfolded, v => v !== undefined);


  return finalChoices;
}
