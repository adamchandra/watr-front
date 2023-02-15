import type { StoryFn } from '@storybook/vue3';

import InfoPane from './story.vue'

export default {
  title: 'Isolates/InfoPane',
  component: InfoPane,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof InfoPane> = (args) => ({
  components: { InfoPane },
  setup() {
    return { ...args  };
  },
  template: '<InfoPane />',
});

export const Primary = Template.bind({});
Primary.args = {
};
