import { Meta, Story } from '@storybook/vue3';
import CounterVue from './Counter.vue';

export default {
  title: 'Counter',
  component: CounterVue,
} as Meta;

const Template: Story<typeof CounterVue> = (args) => ({
  components: { CounterVue },
  setup() {
    return { args };
  },
  template: '<CounterVue v-bind="args" />',
});

export const Plain = Template.bind({});
Plain.args = {};
