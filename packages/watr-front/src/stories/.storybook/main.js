
const path = require('node:path');

module.exports = {
  "stories": ["../*.stories.@(js|jsx|ts|tsx)"],
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

      root: path.dirname(require.resolve('@storybook/builder-vite')),
      define: {
        ...config.define,
        // global: "window",
        global: {},
      },
      esbuild: {
        ...config.esbuild,
        // jsxInject: `import React from 'react'`,
      },


      // `Uncaught Error: Singleton client API not yet initialized, cannot call addParameters`
      // github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
      resolve: {
        dedupe: ["@storybook/client-api"],
        alias: {
          vue: 'vue/dist/vue.esm-bundler.js',
        },
      }


    }
    //   if (!viteConfig.build) {
    //     viteConfig.build = { sourcemap: true };
    //   } else {
    //     viteConfig.build.sourcemap = true;
    //   }

    // https://github.com/vitejs/vite/issues/1973
    // viteConfig.define = {
    //   // "process.env": process.env,
    //   // // By default, Vite doesn't include shims for NodeJS/
    //   // // necessary for segment analytics lib to work
    //   "global": {}
    // }

    //   // workaround for vite build
    //   // Refs: https:github.com/eirslett/storybook-builder-vite/issues/55#issuecomment-871800293
    viteConfig.root = path.dirname(require.resolve('@storybook/builder-vite'));
    // viteConfig.server.fsServe = undefined;
    // //   // * About auto-generated component docs:
    // //   // * Please use FC<Props> instead of React.FC<Props> to declare component.
    // //   // * https:github.com/styleguidist/react-docgen-typescript/issues/323
    // //   // * https:github.com/styleguidist/react-docgen-typescript/issues/393
    // viteConfig.plugins ??= [];

    // //   viteConfig.plugins.push(svgr());
    return viteConfig;
  }
};
