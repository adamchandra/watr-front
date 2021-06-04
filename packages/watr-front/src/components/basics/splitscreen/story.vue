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
      Splitscreen split/Resize Windows
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
          <ul>
            <li v-for="i in 10">
              <span>{{ i  }}</span>
            </li>
          </ul>
        </template>
        <template v-slot:rightside-top>
          <span>Right/Top!</span>
          <ul>
            <li v-for="i in 3">
              <span>{{ i  }}</span>
            </li>
          </ul>
        </template>

        <template v-slot:rightside-bottom>
          <span>Right/Bottom!</span>
          <ul>
            <li v-for="i in 2">
              <span>{{ i  }}</span>
            </li>
          </ul>
        </template>

      </StoryComponent>
    </template>

  </story-layout>
</template>
