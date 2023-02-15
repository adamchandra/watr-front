import type { StoryFn } from '@storybook/vue3';

import CorpusBrowser from './index.vue'

export default {
  title: 'Isolates/CorpusBrowser',
  component: CorpusBrowser,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof CorpusBrowser> = (args) => ({
  components: { CorpusBrowser },
  setup() {
    return { ...args  };
  },
  template: '<CorpusBrowser />',
});

export const Primary = Template.bind({});
Primary.args = {
};
