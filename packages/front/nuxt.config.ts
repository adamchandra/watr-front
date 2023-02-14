import { defineNuxtConfig } from 'nuxt/config';
import * as postcss from './postcss.config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',
  buildModules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['@/assets/sass/app.scss'],
  build: {
    transpile: ['vuetify'],
    postcss: {
      postcssOptions: postcss,
    },
  },
  vite: {
    define: {
      'processe.env.DEBUG': 'false',
    },
  },
});
