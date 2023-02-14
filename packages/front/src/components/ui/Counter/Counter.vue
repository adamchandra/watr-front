<template>
  <div>
    <v-card>
      <v-card-title>カウンター</v-card-title>
      <v-card-text>
        <div>count: {{ counterStore.count }}</div>
        <div>double: {{ counterStore.doubleCount }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="increment">
          いんくりめんと
        </v-btn>
        <v-btn @click="reset">
          りせっと
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import useCounterStore from '@/store/counter';

const counterStore = useCounterStore();

function increment() {
  counterStore.increment();
}

function reset() {
  counterStore.$reset();
}
</script>
