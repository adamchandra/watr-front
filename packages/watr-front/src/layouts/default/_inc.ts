import { storyItems } from '~/pages/stories/autogen/story-list';

export default {
  components: {},

  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        { icon: 'mdi-apps', title: 'Home', to: '/' },
        ...storyItems,
      ],
      miniVariant: false,
      right: false,
      rightDrawer: false,
      title: 'UI Component Development Stories',
    };
  },
};
