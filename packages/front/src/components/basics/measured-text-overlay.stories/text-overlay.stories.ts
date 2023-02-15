import type { StoryFn } from '@storybook/vue3';

import TextOverlay from './text-overlay.vue'

export default {
  title: 'Basics/TextOverlay',
  component: TextOverlay,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof TextOverlay> = (args) => ({
  components: { TextOverlay },
  setup() {
    return { ...args  };
  },
  template: '<TextOverlay />',
});

export const SelectionEvents = Template.bind({});
SelectionEvents.args = {
};
