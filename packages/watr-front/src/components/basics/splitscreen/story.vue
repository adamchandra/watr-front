<script lang="ts">
// story-name=splitScreen
// story-args=
// story-title=Split/Resize Windows
import StoryComponent from './index.vue'
export default {
  components: { StoryComponent }
}
</script>

<template lang="html">
  <story-layout>

    <template v-slot:title>
      Split/Resize Windows
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
      <StoryComponent >
        <template v-slot:leftside>
          <span>Hola!</span>
        </template>
        <template v-slot:rightside-top>
          <span>Right/Top!</span>
        </template>

        <template v-slot:rightside-bottom>
          <span>Right/Bottom!</span>
        </template>

      </StoryComponent>
    </template>

  </story-layout>
</template>
