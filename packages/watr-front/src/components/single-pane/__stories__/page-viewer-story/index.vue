<template lang="html">
    <story-layout>

        <template v-slot:title>
          Pdf Page Image Viewer
        </template>

        <template v-slot:description>
          Image Display, Region Selection, ...
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
            <div class="mountPoint" ref="mountPoint"></div>
        </template>

    </story-layout>
</template>

<script lang="ts" src="./_inc.ts">
// story-name=pdfPageViewer
// story-args=id=austenite.pdf.d
// story-title=Pdf Page Viewer
</script>
