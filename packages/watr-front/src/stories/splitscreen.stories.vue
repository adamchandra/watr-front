
// import vueComponent from '~/components/basics/splitscreen/story.vue'
export default {
  title: 'Example/SplitScreen',
  // component: MyButton,
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
