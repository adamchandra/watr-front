import type { StoryFn } from '@storybook/vue3';

import NarrowingFilter from './index.vue'

export default {
  title: 'Isolates/NarrowingFilter',
  component: NarrowingFilter,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof NarrowingFilter> = (args) => ({
  components: { NarrowingFilter },
  setup() {
    return { ...args  };
  },
  template: '<NarrowingFilter />',
});

export const Primary = Template.bind({});
Primary.args = {
};
