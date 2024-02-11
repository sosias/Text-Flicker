<script setup>
import { useUiStore } from '@/stores/ui'
import UIWordItem from './UIWordItem.vue'
//import ObsWebSocket from './ObsWebSocket.vue'

const store = useUiStore()

import { onMounted, onBeforeUnmount } from 'vue';

const changeScene = (sceneIndex) => {
  store.wordIndex = 0
  store.scene = sceneIndex
}

const selectDevice = (deviceIndex) => {
  store.device = deviceIndex
  store.wordIndex = 0
  store.wordList = wholeData[deviceIndex]
}

let wholeData;
store.device = 0
store.fittedText = false

onMounted(() => {
  //initWebsocketConnection();
  fetchWords();
})

onBeforeUnmount(() => {

})

const fetchWords = async() => {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'data/wordlist.json');
    wholeData = await response.json();
    store.wordList  = wholeData[0]
  } catch (error) {
    console.error(error);
  }
}

</script>

<template>
  <div class="container_settings" v-if="store.isPanelUIVisible">
    <!-- Websocket address
    <section>
      <ObsWebSocket />
    </section>
    <br/> -->
    Device
    <section>
      <div v-for="(device, index) in wholeData" :key="index">
        <button :disabled="index==store.device" v-on:click="selectDevice(index)" :index=index>{{index}}</button>
      </div>
    </section>
    Scene
    <section>
      <div v-for="(scene, index) in store.wordList" :key="index">
        <button :disabled="index==store.scene" v-on:click="changeScene(index)" :index=index>{{index}}</button>
      </div>
    </section>
    <br/>
    Options
    <section>
      Fitting text <input v-model="store.fittedText" type="checkbox" name="scales" checked />
    </section>
    <br/>
    Step velocity
    <section>
      <input v-model.number="store.stepMilliseconds" type="range" min="1" max="1000" class="slider" />
      <input v-model="store.stepMilliseconds" type="number" /><span>ms</span>
    </section>
    <br/>
    Add Random Offset
    <section>
      <input v-model.number="store.randomOffset" type="range" min="0" max="1000" class="slider" />
      <input v-model="store.randomOffset" type="number" /><span>ms</span>
    </section>
    <section class="wordlist">
      <div v-for="(wordItem, index) in store.wordList && store.wordList[store.scene]" :key="index">
        <UIWordItem :on="index==store.wordIndex" :index=index />
      </div>
    </section>
  </div>
</template>

<style scoped>
.container_settings{
  position: absolute;
  background-color: #fff;
  border-radius: 5px;
  right: 0;
  padding: 10px;
  /* margin: 10px; */
}

section{
  display: flex;
  align-items: center;
  gap: 5px;
}
.wordlist{
  padding-top: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-direction: column;
  overflow: auto;
  max-height: 100%;
}
</style>
