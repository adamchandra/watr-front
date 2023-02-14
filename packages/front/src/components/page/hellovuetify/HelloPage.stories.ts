import { Meta, Story } from '@storybook/vue3';
import HelloWorldVue from './HelloWorld.vue';

export default {
  title: 'Hello Page',
  component: HelloWorldVue,
} as Meta;

const Template: Story<typeof HelloWorldVue> = (args) => ({
  components: { HelloWorldVue },
  setup() {
    return { args };
  },
  template: '<HelloWorldVue v-bind="args" />',
});

export const Page = Template.bind({});
Page.args = {
  title: 'page',
};
