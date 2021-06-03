import _ from 'lodash';

import { ref, watch, Ref, defineComponent, inject, SetupContext } from '@vue/composition-api';
import { watchOnceFor } from '~/components/basics/component-basics';

export const ProvidedChoices = 'ProvidedChoices';
export const ProvidedChoicesTrigger = 'ProvidedChoicesTrigger';

export interface NarrowingChoice<T> {
  index: number;
  key: string;
  value: T;
}

export default defineComponent({
  setup(_props, ctx: SetupContext) {
    const { emit } = ctx;

    const currSelectionRef = ref([] as NarrowingChoice<unknown>[])
    const queryTextRef = ref('');

    const initChoicesRef: Ref<number | null> = inject(ProvidedChoicesTrigger, ref(null));
    const choicesRef: Array<NarrowingChoice<unknown>> | null = inject(ProvidedChoices, null);

    const onSubmit = () => {
      emit('items-selected', currSelectionRef.value);
    };

    const onReset = () => {
      queryTextRef.value = '';
      emit('items-reset');
    };

    watch(initChoicesRef, (choicesReady: number | null) => {
      if (choicesReady === null) return;
      const choices = choicesRef;

      const choicesLC = choices.map(c => [c, c.key.toLowerCase()] as const);
      currSelectionRef.value = choices;

      const updateSelection = (query: string) => {
        const terms = query.split(/[ ]+/g);
        const hits = _.filter(choicesLC, ([, choice]) => {
          const lc = choice.toLowerCase();
          return _.every(terms, term => lc.includes(term))
        });

        currSelectionRef.value = _.map(hits, ([ch,]) => ch);
      }
      const debounced = _.debounce(updateSelection, 300);

      watch(queryTextRef, (queryText) => {
        debounced(queryText);
      });

    });

    return {
      currSelectionRef,
      queryTextRef,
      onSubmit,
      onReset,
    };

  }
});
