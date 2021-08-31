import _ from 'lodash';

import { ref, watch, Ref, defineComponent, inject, SetupContext, shallowRef } from '@nuxtjs/composition-api';


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

      const finalChoices = labelRadToDisplayables(choices)
      currSelectionRef.value = finalChoices;

      const updateSelection = (query: string) => {
        const terms = query.split(/[ ]+/g);
        const allHitLabels = radFoldUp(choices, (path, { nodeData, childResults }) => {
          const hitLabels = _.filter(nodeData.labels, l => {
            const tags = getLabelProp(l, 'tags')
            const tagMatch = _.some(terms, term => _.some(tags, tag => tag.includes(term)))
            const pathMatch = _.some(terms, term => _.some(path, pseg => pseg.includes(term)))
            return tagMatch || pathMatch;
          })

          return _.concat(childResults, hitLabels);
        });
      }
      // const debounced = _.debounce(updateSelection, 300);

      // watch(queryTextRef, (queryText) => {
      //   debounced(queryText);
      // });

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

function labelRadToDisplayables(labelRadix: Radix<LabelSelection>): Array<NarrowingChoice<Label[]>> {
  const unfolded: NarrowingChoice<Label[]>[] = radUnfold(labelRadix, (path, labelSelection) => {
    if (path.length === 0) {
      return undefined;
    }
    const outlineHeader = _.last(path);
    const tags = labelSelection ? Array.from(labelSelection.tags) : [];
    const labels = labelSelection ? labelSelection.labels : [];
    return {
      index: 0,
      indent: `pl-${(path.length - 1) * 3}`,
      display: outlineHeader,
      value: labels,
      count: labels.length,
      tags
    };
  });
  const finalChoices = _.filter(unfolded, v => v !== undefined);


  return finalChoices;
}
