import { defineNuxtPlugin } from '#app';
import { createVuetify } from 'vuetify';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      themes: {
        light: {
          colors: {
            primary: '#000d6d',
            background: '#fff',
            error: '#d63031',
            info: '#0984e3',
            secondary: '#EDF2F7',
            success: '#00cec9',
            surface: '#fff',
            warning: '#2d3436',
          },
          dark: true,
          variables: {},
        },
      },
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
