<template>
  <v-btn :color="color" :disabled="disabled" :style="style" @click="onClick">
    {{ label }}
  </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: 'Button',
  },
});

const style = computed(() => ({ 'background-color': props.color }));

const emit = defineEmits(['click']);

const onClick = (event: Event) => {
  emit('click', event);
};
</script>

<style></style>
