<script setup>
import { textFlickerMain } from "./flickerCore/coreTextFlicker.js";
import { useUiStore } from '@/stores/ui';
import { onMounted, ref } from 'vue';
import MiniUI from './components/MiniUI.vue'
import HintsHud from './components/HintsHud.vue'
import EffectCanvas from './components/EffectCanvas.vue'

const store = useUiStore();
store.isMiniUIVisible = false;

const canvasOutlet = ref("canvasOutlet");

const fetchWords = async() => {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'data/wordlist.json');
    store.wholeData = await response.json();
    store.wordList = store.wholeData[0]
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  store.device = 0
  store.scene = 0
  fetchWords()
  store.isPlaying = false
  store.fittedText = false
  store.blur = false
  store.calibration = false
  const result = textFlickerMain(canvasOutlet.value);
  Object.assign(canvasOutlet.value, result);
});
</script>

<template>
  <HintsHud />
  <EffectCanvas v-if="store.calibration" />
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

canvas{
  //background-color: black;
  position: absolute;
}

@font-face {
    font-family: "din-bold";
    src: url('assets/fonts/D-DIN-Bold.otf');
}
</style>