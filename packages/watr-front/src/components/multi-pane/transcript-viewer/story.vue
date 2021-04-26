<script lang="ts">
// story-name=transcriptViewer
// story-args=id=austenite.pdf.d
// story-title=App[Image+Stanza+Labels]
import StoryComponent from './index.vue'
export default {
  components: { StoryComponent }
}
</script>

<template lang="html">
  <story-layout>

    <template v-slot:title>
      Pdf Transcript Viewer
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
