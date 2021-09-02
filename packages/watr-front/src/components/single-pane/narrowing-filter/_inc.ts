import _ from 'lodash';

import { ref, watch, Ref, defineComponent, inject, SetupContext, shallowRef } from '@nuxtjs/composition-api';

import Bluebird from 'bluebird';

import {
  Radix,
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

import { Label } from '~/lib/transcript/labels';
import {
  ItemGroup, NodeLabel, queryAndUpdateDisplayTree, renderDisplayTree, RenderedGroup, RenderedItem, span
} from './display-tree';
import { getLabelProp } from '~/lib/transcript/tracelogs';

type DisplayTreeT = Radix<NodeLabel<ItemGroup<Label>>>;
type RenderedGroupT = RenderedGroup<Label[]>;


function getLabelTerms(label: Label): string[] {
  const tags = getLabelProp(label, 'tags');
  return _.concat(tags, label.name);
}

function renderLabelGroup(labels: Label[]): RenderedItem {
  const head = labels[0];
  const allTags = _.flatten(labels.map(l => getLabelProp(l, 'tags')));
  const tagSet = new Set<string>(allTags);
  const name = head ? head.name : '???'

  const tagList = _.join(Array.from(tagSet), ', ');
  const nameDisp = `${name}   ${tagList}`;
  return span(nameDisp, 'label')
}


async function updateDisplay(
  choices: DisplayTreeT,
  query: string,
  renderedRef: Ref<RenderedGroupT[]>,
  priorAttempt?: Bluebird<void>
): Bluebird<void> {
  const delay = priorAttempt ? priorAttempt : Bluebird.resolve(undefined);

  return delay.then(() => {
    queryAndUpdateDisplayTree(choices, query, (label) => {
      return getLabelTerms(label);
    });
    const renderedChoices = renderDisplayTree(choices, renderLabelGroup);

    renderedRef.value = renderedChoices;
  });
}

export default defineComponent({
  setup(_props, ctx: SetupContext) {
    const { emit } = ctx;

    const currSelectionRef = ref([] as RenderedGroupT[])
    const queryTextRef = ref('');

    const choicesRef: Ref<DisplayTreeT | null> = inject(ProvidedChoices, shallowRef(null));

    const onSubmit = () => {

      const items = _.flatMap(
        currSelectionRef.value, v => {
          return v.nodeData ? v.nodeData : []
        }
      )
      emit('items-selected', items);
    };

    const onReset = () => {
      queryTextRef.value = '';
      emit('items-reset');
    };

    watch(choicesRef, (choices) => {
      if (choices === null) return;

      let currUpdate: Bluebird<void> = updateDisplay(choices, '', currSelectionRef, undefined);

      const updateSelection = (query: string) => {
        currUpdate = updateDisplay(choices, query, currSelectionRef, currUpdate);
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
