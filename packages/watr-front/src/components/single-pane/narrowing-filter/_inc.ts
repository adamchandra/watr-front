import _ from 'lodash';

import {
  ref as deepRef,
  watch,
  Ref,
  defineComponent,
  inject,
  SetupContext,
  shallowRef,
} from '@nuxtjs/composition-api';

// import Bluebird from 'bluebird';

import {
  Radix,
} from '@watr/commonlib-shared';

import { Label } from '~/lib/transcript/labels';
import {
  TreeNode,
  queryAndUpdateDisplayTree,
  renderDisplayTree,
  RenderedGroup,
  RenderedItem,
  span,
  renderAbbrevString,
} from './display-tree';

import { getLabelProp } from '~/lib/transcript/tracelogs';

export const ProvidedChoices = 'ProvidedChoices';

type DisplayTreeT = Radix<TreeNode<Label[]>>;
type RenderedGroupT = RenderedGroup<Label[]>;

function getLabelTerms(label: Label): string[] {
  const tags = getLabelProp(label, 'tags');
  const fonts = getLabelProp(label, 'Fonts');
  return _.concat(tags, fonts);
}

function renderLabelGroup(labels: Label[]): RenderedItem {
  const terms = labels.flatMap(l => getLabelTerms(l));
  const tagSet = new Set<string>(terms);
  const tagArray = Array.from(tagSet);
  const abbrevTags = renderAbbrevString(tagArray);
  const nameDisp = abbrevTags;
  return span(nameDisp, 'label');
}

async function updateDisplay(
  choices: DisplayTreeT,
  query: string,
  renderedRef: Ref<RenderedGroupT[]>,
  priorAttempt?: Promise<void>,
): Promise<void> {
  const delay = priorAttempt || Promise.resolve();

  return delay.then(() => {
    queryAndUpdateDisplayTree(choices, query, (label) => getLabelTerms(label).map(s => s.toLowerCase()));
    const renderedChoices = renderDisplayTree(choices, renderLabelGroup);

    renderedRef.value = renderedChoices;
  });
}

export default defineComponent({
  setup(_props, ctx: SetupContext) {
    const { emit } = ctx;

    const currSelectionRef = shallowRef([] as RenderedGroupT[]);
    const queryTextRef = deepRef('');

    const choicesRef: Ref<DisplayTreeT | null> = inject(ProvidedChoices, shallowRef(null));

    const onSubmit = () => {
      const items = _.flatMap(
        currSelectionRef.value, v => (v.nodeData ? v.nodeData : []),
      );
      emit('items-selected', items);
    };

    const onReset = () => {
      queryTextRef.value = '';
      emit('items-reset');
    };

    watch(choicesRef, (choices) => {
      if (choices === null) return;

      let currUpdate: Promise<void> = updateDisplay(choices, '', currSelectionRef);

      const updateSelection = (query: string) => {
        currUpdate = updateDisplay(choices, query, currSelectionRef, currUpdate);
      };
      const debounced = _.debounce(updateSelection, 300);

      watch(queryTextRef, (queryText) => {
        debounced(queryText);
      });
    }, {
      deep: false,
    });

    return {
      choicesRef,
      currSelectionRef,
      queryTextRef,
      onSubmit,
      onReset,
    };
  },
});
