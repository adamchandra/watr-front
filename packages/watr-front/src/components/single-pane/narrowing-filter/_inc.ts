import _ from 'lodash';

import { ref, watch, Ref, defineComponent, inject, SetupContext, shallowRef } from '@nuxtjs/composition-api';

export const ProvidedChoices = 'ProvidedChoices';
// export const ProvidedChoicesTrigger = 'ProvidedChoicesTrigger';

export interface NarrowingChoice<T> {
  index: number;
  display: string;
  tags: string;
  value: T;
}

export default defineComponent({
  setup(_props, ctx: SetupContext) {
    const { emit } = ctx;

    const currSelectionRef = ref([] as NarrowingChoice<unknown>[])
    const queryTextRef = ref('');

    const choicesRef: Ref<Array<NarrowingChoice<unknown>> | null> = inject(ProvidedChoices, shallowRef(null));


    const onSubmit = () => {
      emit('items-selected', currSelectionRef.value);
    };

    const onReset = () => {
      queryTextRef.value = '';
      emit('items-reset');
    };

    watch(choicesRef, (choices) => {
      if (choices === null) return;
      // const choices = choicesRef;

      const choicesLC = choices.map(c => [c, c.display.toLowerCase()] as const);
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
