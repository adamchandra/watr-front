const path = require('node:path');

module.exports = {
  "stories": ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-scss"
  ],
  "framework": "@storybook/vue3",
  core: {
    builder: "@storybook/builder-vite",
    sendTelemetry: false
  },
  viteFinal: (config) => {
    // github.com/storybookjs/storybook/discussions/17433
    const baseUrl = process.env.BASE_URL;
    if (baseUrl) {
      config.base = `${baseUrl}/`;
    }

    return {
      ...config,

      // Refs: https:github.com/eirslett/storybook-builder-vite/issues/55#issuecomment-871800293
      root: path.dirname(require.resolve('@storybook/builder-vite')),
      define: {
        ...config.define,
        global: {},
      },
      esbuild: {
        ...config.esbuild,
      },

      // `Uncaught Error: Singleton client API not yet initialized, cannot call addParameters`
      // github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
      resolve: {
        dedupe: ["@storybook/client-api"],
        alias: {
          vue: 'vue/dist/vue.esm-bundler.js',
        },
      }
    };
  }
};
