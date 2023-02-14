import type { Meta, StoryFn } from '@storybook/vue3';

import MyHeader from './Header.vue';

export default {
  title: 'Given/Header2',
  component: MyHeader,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template: StoryFn<typeof MyHeader> = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { MyHeader },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    // Story args can be spread into the returned object
    return { ...args };
  },
  // Then, the spread values can be accessed directly in the template
  template: '<my-header :user="user" />',
});

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  user: {
    name: 'Jane Doe',
  },
};

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  user: null,
};
