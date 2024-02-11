<script setup>
import { textFlickerMain } from "./flickerCore/coreTextFlicker.js";
import { useUiStore } from '@/stores/ui';
import { onMounted, ref } from 'vue';
import MiniUI from './components/MiniUI.vue'

const store = useUiStore();
store.isMiniUIVisible = false;

const canvasOutlet = ref("canvasOutlet");

onMounted(() => {
  const result = textFlickerMain(canvasOutlet.value);
  Object.assign(canvasOutlet.value, result);
});
</script>

<template>
  <div id="canvas" ref="canvasOutlet" v-on:click="store.isMiniUIVisible=!store.isMiniUIVisible"></div>
  <MiniUI />
</template>

<style lang="scss">
#app{
  //position: absolute;
}

#canvas{
  position: absolute;
}
</style>