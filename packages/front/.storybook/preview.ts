import { app } from '@storybook/vue3'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const vuetify = createVuetify({
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
        variables: {},
      },
    },
  },
})
app.use(vuetify)

const pinia = createPinia();

app.use(pinia)

import '../src/assets/sass/app.scss'
import { create } from 'lodash'

// export const parameters = {
//   actions: { argTypesRegex: "^on[A-Z].*" },
//   controls: {
//     matchers: {
//       color: /(background|color)$/i,
//       date: /Date$/,
//     },
//   },
// }

export const decorators = [
  (story) => ({
    components: {story},
    template: '<v-app><story /></v-app>',
  })
]