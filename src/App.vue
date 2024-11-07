<script setup>
import { textFlickerMain } from "./flickerCore/coreTextFlicker.js";
import { useUiStore } from '@/stores/ui';
import { onMounted, ref } from 'vue';
import MiniUI from './components/MiniUI.vue'
import HintsHud from './components/HintsHud.vue'
import EffectCanvas from './components/EffectCanvas.vue'
import VideoScene from './components/VideoScene.vue'

const store = useUiStore();
store.isMiniUIVisible = false;

const cachedData = localStorage.getItem("wholeData");

const canvasOutlet = ref("canvasOutlet");

const fetchWords = () => {
    fetch(import.meta.env.BASE_URL + 'data/wordlist.json').then((response)=>{
      return response.json()
    }).then((data)=>{
      store.wholeData = data
      store.scenes = store.wholeData.scenes
      store.wordList = store.wholeData.data[0]
      store.originalData = store.wholeData
    }).catch((error)=>{
      console.error(error);
    })
}

onMounted(() => {
  store.device = 0
  store.currentScene = 0
  store.wordScene = 0
  if(cachedData){
    store.wholeData = JSON.parse(cachedData)
    store.scenes = store.wholeData.scenes
    store.wordList = store.wholeData.data[0]
  }else{
    fetchWords()
  }
  store.isPlaying = false
  store.fittedText = false
  store.blur = false
  store.motionBlur = false
  store.fx_on = false
  store.wordListShow = false
  store.fx_divergence = 0.0
  store.fx_sequencePlaying = false
  const result = textFlickerMain(canvasOutlet.value);
  Object.assign(canvasOutlet.value, result);
});

const dbName = "textFlickerDB";
const request = indexedDB.open(dbName, 1);
request.onerror = (event) => {
  console.error('cannot open local db')
};
request.onupgradeneeded = (event) => {
  const db = event.target.result;

  const objectStore = db.createObjectStore("videos", { keyPath: "id" });
  //objectStore.createIndex("data", "data", { unique: false });

  objectStore.transaction.oncomplete = (event) => {

    const videoObjectStore = db
      .transaction("videos", "readwrite")
      .objectStore("videos");

    videoObjectStore.add({id:'1',data:'aaa'});
  };
};
</script>

<template>
  <!-- <HintsHud /> -->
  <VideoScene />
  <EffectCanvas v-if="store.fx_on" />
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