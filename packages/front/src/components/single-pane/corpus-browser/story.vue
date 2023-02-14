<script lang="ts">
 // story-name=corpusBrowser
 // story-args=
   // story-title=Corpus Listing Browser
 import StoryComponent from './index.vue'
 export default {
   components: { StoryComponent }
 }
</script>

<template >
  <story-layout>

    <template v-slot:title>
      Corpus Browser
    </template>

    <template v-slot:description>
    </template>

    <template v-slot:controls>
      <v-container>
        <v-row>
          <v-col />
        </v-row>
      </v-container>
    </template>

    <template v-slot:notes>
      Notes...
    </template>

    <template v-slot:main>
      <StoryComponent />
    </template>

  </story-layout>
</template>
