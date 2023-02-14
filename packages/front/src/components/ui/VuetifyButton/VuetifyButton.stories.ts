import { Meta, Story } from '@storybook/vue3';
import VuetifyButtonVue from './VuetifyButton.vue';

export default {
  title: 'VuetifyButton',
  component: VuetifyButtonVue,
} as Meta;

const Template: Story<typeof VuetifyButtonVue> = (args) => ({
  components: { VuetifyButtonVue },
  setup() {
    return { args };
  },
  template: '<VuetifyButtonVue v-bind="args" />',
});

export const Plain = Template.bind({});
Plain.args = {

};

export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  label: 'secondary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};
