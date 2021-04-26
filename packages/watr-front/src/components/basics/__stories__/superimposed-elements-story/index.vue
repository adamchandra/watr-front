<template lang="html">

    <story-layout>

        <template v-slot:title>
            Superimposed Elements Overlay
        </template>

        <template v-slot:description>
            Any combination of Img, Canvas, Svg, Div
        </template>

        <template v-slot:notes>
            <p>
                Compositional component to create overlays of Img, HtmlCanvas, HtmlDiv, and SVG elements,
                superimposed and aligned such that Canvas and Svg elements may be used to draw on
                the underlying image, and HtmlDiv can provide positioned text overlays.
            </p>

            <ul>
                <li>Show that elements are perfectly aligned</li>
                <li>Show that drawing on Svg and Canvas produces perfectly aligned shapes</li>
                <li>Show that text may be overlayed </li>
                <li>Constrain setDimensions(w, h) such that img.src aspect ratio may be preserved</li>
            </ul>
        </template>

        <template v-slot:main>
            <div class="mountPoint" ref="mountPoint"></div>
        </template>

    </story-layout>
</template>

<script lang="ts" src="./superimposed-elements-story.ts">
// story-name=superimposedElementsStory
// story-title=Superimposed Elements Story
</script>

<style lang="scss" scoped>
    @import '~/assets/sass/overlayed-svg-canvas-div';
</style>
