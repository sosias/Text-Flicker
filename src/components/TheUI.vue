<script setup>
import { useUiStore } from '@/stores/ui'
import UIWordItem from './UIWordItem.vue'
import { ref } from 'vue';
//import ObsWebSocket from './ObsWebSocket.vue'

const store = useUiStore()

import { onMounted, onBeforeUnmount } from 'vue';

const selectDevice = (deviceIndex) => {
  store.device = deviceIndex
  store.wordIndex = 0
  store.wordList = wholeData[deviceIndex]
}

let wholeData;
store.device = 0
store.fittedText = false
store.blur = false

onMounted(() => {
  //initWebsocketConnection();
  fetchWords();
})

onBeforeUnmount(() => {

})

const setWholeData = (data) => {
  wholeData = data
  store.wordList  = wholeData[0]
}

const fileInput = ref("fileInput");
const importJson = () => {
  fileInput.value.click();
}

const loadJSONFromFile = (event) => {
  const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let fileContent = JSON.parse(e.target.result)
          setWholeData(fileContent)
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    reader.readAsText(file);
  }
}

const fetchWords = async() => {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'data/wordlist.json');
    let wholeData = await response.json();
    setWholeData(wholeData)
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
    <br />
    <section>
      <input type="file" ref="fileInput" v-on:change="loadJSONFromFile" hidden />
      <button class="button" v-on:click="importJson()">Import json</button>
    </section>
    <br />
    <!-- <section>
      <button class="button" v-on:click="console.log(JSON.stringify(store.wordList))">Print json</button>
    </section>
    <br /> -->
    <!-- Options -->
    <!-- <section>
      Fitting text <input v-model="store.fittedText" type="checkbox" checked />
    </section> -->
    <section>
      Blur <input v-model="store.blur" type="checkbox" />
    </section>
    <!-- <br/>
    Step velocity
    <section>
      <input v-model.number="store.stepMilliseconds" type="range" min="1" max="300" class="slider" />
      <input v-model="store.stepMilliseconds" type="number" /><span>ms</span>
    </section> -->
    <!-- <br/>
    Add Random Offset
    <section>
      <input v-model.number="store.randomOffset" type="range" min="0" max="1000" class="slider" />
      <input v-model="store.randomOffset" type="number" /><span>ms</span>
    </section> -->
    <section class="wordlist">
      <UIWordItem v-for="(wordItem, index) in store.wordList && store.wordList[store.scene]" :key="index" :on="index==store.wordIndex" :index=index />
    </section>
  </div>
</template>

<style scoped>
.container_settings{
  position: absolute;
  background-color: #fff;
  border-radius: 5px;
  right: 0;
  top: 0;
  padding: 10px;
  width: 100%;
  max-width: 300px;
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
