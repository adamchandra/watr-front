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
  // Components used in your story `template` are defined in the `components` object
  components: { TextOverlay },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { ...args  };
  },
  template: '<TextOverlay />',
});

export const SelectionEvents = Template.bind({});
SelectionEvents.args = {
};
