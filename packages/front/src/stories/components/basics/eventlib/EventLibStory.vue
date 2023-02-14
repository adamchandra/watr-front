
<template>
  <div>
    <ul>
      <li>
        <h3>Mouse Activity {{ mouseActivity }}</h3>
      </li>
      <li>
        <h3>Selection Rect: {{ selectionRef }}</h3>
      </li>
      <li v-for="(item, i) in mouseActivityLog" :key="i">
        {{item}}
      </li>

    </ul>

    <div ref="mountPoint" id="event-div" class="eventbox"> </div>

  </div>
</template>


<script lang="ts" src="./EventLibStory.ts"> </script>

<style lang="scss" src="./EventLibStory.scss" scoped></style>
