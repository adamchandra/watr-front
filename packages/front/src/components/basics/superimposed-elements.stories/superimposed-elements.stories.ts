import type { StoryFn } from '@storybook/vue3';

import SuperimposedElements from './superimposed-elements.vue'

export default {
  title: 'Basics/SuperimposedElements',
  component: SuperimposedElements,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof SuperimposedElements> = (args) => ({
  components: { SuperimposedElements },
  setup() {
    return { ...args  };
  },
  template: '<SuperimposedElements />',
});

export const Primary = Template.bind({});
