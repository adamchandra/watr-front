
// import StoryComponent from '../components/basics/splitscreen/index.vue'
import StoryComponent from '../components/basics/splitscreen/index.vue'

// import vueComponent from '~/components/basics/splitscreen/story.vue'
export default {
  title: 'Example/SplitScreen',
  component: StoryComponent,
  // More on argTypes: https://storybook.js.org/docs/vue/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    onClick: {},
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

const Template = (args: any) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { StoryComponent },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<StoryComponent v-bind="args" />',
});

export const BasicSplit = Template.bind({});
// BasicSplit.args = {

// };
