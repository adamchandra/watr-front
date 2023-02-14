import { setup } from '@storybook/vue3';
import { registerPlugins } from '../src/plugins';

setup((app) => {
  // Registers your app's plugins into Storybook
  registerPlugins(app);
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
