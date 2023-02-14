import type { StoryFn } from '@storybook/vue3';

import SplitScreen from '~/components/basics/splitscreen/index.vue';

export default {
  title: 'Basics/SplitScreen',
  component: SplitScreen,
  parameters: {
    layout: 'fullscreen',
  },
};

const template = `
      <SplitScreen v-bind:rightSidePanes="3">
        <template v-slot:leftside>
          <div class="panel-content">
            <ul>
              <li v-for="i in 10">
                <span>{{ i }}</span>
              </li>
            </ul>
          </div>
        </template>

        <template v-slot:rightside#1>
          <div class="panel-content">
            <span>Right/1!</span>
            <ul>
              <li v-for="i in 3">
                <span>{{ i }}</span>
              </li>
            </ul>
          </div>
        </template>

        <template v-slot:rightside#3>
          <div class="panel-content">
            <span>Right/3!</span>
            <ul>
              <li v-for="i in 2">
                <span>{{ i }}</span>
              </li>
            </ul>
          </div>
        </template>

      </SplitScreen>
`

const Template: StoryFn<typeof SplitScreen> = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { SplitScreen },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    // Story args can be spread into the returned object
    return { ...args };
  },
  // Then, the spread values can be accessed directly in the template
  template
});

export const Config1 = Template.bind({});
Config1.args = {
  rightSidePanes: 3
};

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  user: null,
};
