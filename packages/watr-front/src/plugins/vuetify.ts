// plugins/vuetify.ts
import { defineNuxtPlugin } from '#app'
import { createVuetify } from 'vuetify'

// Import everything
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
   const vuetify = createVuetify({
       components,
       directives
   })
   nuxtApp.vueApp.use(vuetify)
});
