<template >
  <div>
    <!-- Text Overlay -->

    <!-- Text with rtree-hovering enabled -->

    <v-container>

    <v-row>
      <v-col justify="space-between" cols="4">
        <v-textarea outlined hide-details dense class label="Input Text" v-model="inputText" />

        <v-text-field
          outlined
          dense
          hide-details
          class="mt-3"
          label="Size"
          persistent-hint
          filled
          v-model="textSize"
        />

        <v-text-field
          outlined
          hide-details
          dense
          class="mt-3"
          label="Top"
          persistent-hint
          v-model="textTop"
        />

        <v-text-field
          outlined
          hide-details
          dense
          class="mt-3"
          label="Left"
          persistent-hint
          v-model="textLeft"
        />

        <v-text-field
          outlined
          hide-details
          dense
          class="mt-3"
          label="Font Family"
          persistent-hint
          v-model="textFamily"
        />
      </v-col>
      <v-col>
        <pre>{{ textDimensions }}</pre>
      </v-col>
    </v-row>

    </v-container>
    <div>Some text</div>

    <!-- <li>Setting Left value causes glitches</li>
         <li>Top seems to be in ems, Left in px</li>
         <li>Hovering</li>
         <li>Transparency</li>
    -->
    <div class="mountPoint" ref="mountPoint"></div>
  </div>
</template>

<script lang="ts" src="./text-overlay.ts">
</script>
