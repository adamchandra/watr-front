<script lang="ts">
// story-name=splitScreen
// story-args=
// story-title=Split/Resize Windows
import StoryComponent from './index.vue'
export default {
  components: { StoryComponent }
}
</script>

<style lang="scss" >

 .panel-content {
     border: 2px solid yellow;
     background-color: lightblue;
 }

</style>
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
      <StoryComponent v-bind:rightSidePanes="3">
        <template v-slot:leftside>
          <div class="panel-content">
            <ul>
              <li v-for="i in 10">
                <span>{{ i }}</span>
              </li>
            </ul>
          </div>
        </template>

        <template v-slot:rightside#1>
          <div class="panel-content">
            <span>Right/1!</span>
            <ul>
              <li v-for="i in 3">
                <span>{{ i }}</span>
              </li>
            </ul>
          </div>
        </template>

        <template v-slot:rightside#3>
          <div class="panel-content">
            <span>Right/3!</span>
            <ul>
              <li v-for="i in 2">
                <span>{{ i }}</span>
              </li>
            </ul>
          </div>
        </template>

      </StoryComponent>
    </template>

  </story-layout>
</template>
