// import colors from 'vuetify/es5/util/colors'

import vuetify from 'vite-plugin-vuetify'
// import { defineNuxtConfig } from 'nuxt'
import path from 'path';
const resolve = path.resolve;

const rootDir = __dirname;
const srcDir = resolve(rootDir, 'src');

export default defineNuxtConfig({
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  srcDir,

  // // Global page headers: https://go.nuxtjs.dev/config-head
  // head: {
  //   titleTemplate: '%s - nuxtapp',
  //   title: 'nuxtapp',
  //   htmlAttrs: {
  //     lang: 'en'
  //   },
  //   meta: [
  //     { charset: 'utf-8' },
  //     { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  //     { hid: 'description', name: 'description', content: '' },
  //     { name: 'format-detection', content: 'telephone=no' }
  //   ],
  //   link: [
  //     { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  //   ]
  // },

  // // Customize the progress-bar color
  // loading: { color: '#fff' },


  // // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/global-components',
    '~/plugins/vuetify'
  ],

  // // Auto import components: https://go.nuxtjs.dev/config-components
  // // components: true,

  // // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  // buildModules: [
  //   '@nuxtjs/vuetify',
  // ],

  // // Modules: https://go.nuxtjs.dev/config-modules
  // modules: [
  //   // https://go.nuxtjs.dev/axios
  //   '@nuxtjs/axios'
  // ],

  // // Axios module configuration: https://go.nuxtjs.dev/config-axios
  // axios: {
  //   // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
  //   baseURL: '/'
  // },
  // alias: {

  // },


  // Global CSS: https:go.nuxtjs.dev/config-css
  css: [
    'vuetify/lib/styles/main.sass',
    'vuetify/styles',
    "@mdi/font/css/materialdesignicons.min.css",
    '~/assets/sass/main.scss'
  ],

  build: {
    transpile: ['vuetify']
  },

  vite: {
    // @ts-ignore
    // curently this will lead to a type error, but hopefully will be fixed soon #justBetaThings
    ssr: {
      noExternal: ['vuetify'], // add the vuetify vite plugin
    },

    define: {
      'process.env.DEBUG': false,
    }
  },
  modules: [
    // @ts-ignore
    // this adds the vuetify vite plugin
    // also produces type errors in the current beta release
    async (options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', config => config.plugins.push(
        vuetify()
      ))
    }
  ]
  // // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  // vuetify: {
  //   customVariables: ['~/assets/variables.scss'],
  //   theme: {
  //     dark: true,
  //     themes: {
  //       dark: {
  //         primary: colors.blue.darken2,
  //         accent: colors.grey.darken3,
  //         secondary: colors.amber.darken3,
  //         info: colors.teal.lighten1,
  //         warning: colors.amber.base,
  //         error: colors.deepOrange.accent4,
  //         success: colors.green.accent3
  //       }
  //     }
  //   }
  // },

});
