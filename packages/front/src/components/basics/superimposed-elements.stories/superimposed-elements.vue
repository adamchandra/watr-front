<template >

  <!-- Compositional component to create overlays of Img, HtmlCanvas, HtmlDiv, and SVG elements,
       superimposed and aligned such that Canvas and Svg elements may be used to draw on
       the underlying image, and HtmlDiv can provide positioned text overlays.

       <li>Show that elements are perfectly aligned</li>
       <li>Show that drawing on Svg and Canvas produces perfectly aligned shapes</li>
       <li>Show that text may be overlayed </li>
       <li>Constrain setDimensions(w, h) such that img.src aspect ratio may be preserved</li>
  -->
  <div class="mountPoint" ref="mountPoint"></div>

</template>

<script lang="ts" src="./superimposed-elements.ts">
// story-name=superimposedElementsStory
// story-title=Superimposed Elements Story
</script>

<style lang="scss" scoped>
    @import '@/assets/sass/overlayed-svg-canvas-div';
</style>
