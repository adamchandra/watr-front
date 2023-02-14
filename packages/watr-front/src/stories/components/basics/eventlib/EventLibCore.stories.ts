import type { StoryFn } from '@storybook/vue3';

import EventLibStory from './EventLibStory.vue'


export default {
  title: 'Basics/EventlibCore',
  component: EventLibStory,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof EventLibStory> = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { EventLibStory },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { ...args  };
  },
  template: '<EventLibStory />',
});

export const SelectionEvents = Template.bind({});
SelectionEvents.args = {
};
