import _ from 'lodash';

import { ref, watch, Ref, defineComponent, inject, SetupContext } from '@vue/composition-api';
import { watchOnceFor } from '~/components/basics/component-basics';

export const ProvidedChoices = 'ProvidedChoices';

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

    const choicesRef: Ref<Array<NarrowingChoice<unknown>> | null> = inject(ProvidedChoices, ref(null))


    const onSubmit = () => {
      emit('items-selected', currSelectionRef.value);
    };

    const onReset = () => {
      queryTextRef.value = '';
      emit('items-reset');
    };

    watchOnceFor(choicesRef, (choices: NarrowingChoice<unknown>[] | null) => {
      if (choices === null) return;

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
