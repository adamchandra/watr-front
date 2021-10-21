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

import Bluebird from 'bluebird';

import {
  Radix,
} from '@watr/commonlib-shared';

export const ProvidedChoices = 'ProvidedChoices';

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

type DisplayTreeT = Radix<TreeNode<Label[]>>;
type RenderedGroupT = RenderedGroup<Label[]>;


function getLabelTerms(label: Label): string[] {
  const tags = getLabelProp(label, 'tags');
  const fonts = getLabelProp(label, 'Fonts');
  return _.concat(tags, fonts);
}

function renderLabelGroup(labels: Label[]): RenderedItem {
  const terms = _.flatten(labels.map(l => getLabelTerms(l)));
  const tagSet = new Set<string>(terms);
  const abbrevTags = renderAbbrevString(Array.from(tagSet));
  const nameDisp = abbrevTags;
  return span(nameDisp, 'label');
}


async function updateDisplay(
  choices: DisplayTreeT,
  query: string,
  renderedRef: Ref<RenderedGroupT[]>,
  priorAttempt?: Bluebird<void>,
): Bluebird<void> {
  const delay = priorAttempt ? priorAttempt : Bluebird.resolve(undefined);

  return delay.then(() => {
    queryAndUpdateDisplayTree(choices, query, (label) => {
      return getLabelTerms(label).map(s => s.toLowerCase());
    });
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
        currSelectionRef.value, v => {
          return v.nodeData ? v.nodeData : [];
        },
      );
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
