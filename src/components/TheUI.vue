<script setup>
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import UIWordItem from './UIWordItem.vue'

const store = useUiStore()
const isVisible = ref(true)

import { onMounted, onBeforeUnmount } from 'vue';

const toggleVisibility = () => {
    isVisible.value = !isVisible.value
};

const userReleaseKey = ({ code }) => {
    if (code === 'KeyH') {
        toggleVisibility()
    }
};

const changeScene = (sceneIndex) => {
  store.wordIndex = 0
  store.scene = sceneIndex
}

const uuidv4 = () => {
 return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
 );
}

let sceneName = []

onMounted(() => {
  initWebsocketConnection();
  fetchWords();
  document.addEventListener('keyup', userReleaseKey, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('keyup', userReleaseKey, true)
})

const fetchWords = async() => {
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'data/wordlist.json');
    store.wordList  = await response.json();
  } catch (error) {
    console.error(error);
  }
}


const initWebsocketConnection = async() => {

  const obsSocket = new WebSocket('ws://localhost:4455');

  obsSocket.onopen = () => {
    console.log('Connected to OBS WebSocket');
  };

  obsSocket.onmessage = (msg)=>{
    console.log(msg)
    console.log(JSON.parse(msg.data))
    var data = JSON.parse(msg.data);
    if(data.op == 0){ // if Hello is received identify client
      var rpcVersion = data.d.rpcVersion
      obsSocket.send(JSON.stringify({
        "op": 1, // identify
        "d": {
          "rpcVersion": rpcVersion
        }
      }));
    } else if(data.op == 2){
      obsSocket.send(JSON.stringify({
        "op": 6, // request
        "d": {
          requestType: "GetSceneList",
          requestId: uuidv4(),
        }
      }));
    } else if (data.op == 7 && data.d.requestType == "GetSceneList"){
      sceneName = data.d.responseData.scenes.map((item)=>{return item.sceneName})
    } 
    else if(data.op == 5 && data.d.eventType == "CurrentProgramSceneChanged"){
      changeScene(sceneName.indexOf(data.d.eventData.sceneName))
    }
  }

  obsSocket.onerror = (event) => {
      console.error("WebSocket Error:", event);
  };

  obsSocket.onclose = () => {
    console.log('Disconnected from OBS WebSocket');
  };
}

</script>

<template>
  <div class="container" v-if="isVisible">
    <section>
      <button class="button" v-on:click="isVisible = false">hide</button><span>shortcut 'h' toggle panel</span>
    </section>
    <br/>
    Scene
    <section>
      <div v-for="(scene, index) in store.wordList" :key="index">
        <button :disabled="index==store.scene" v-on:click="changeScene(index)" :index=index>{{index}}</button>
      </div>
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
.container{
  position: absolute;
  background-color: #fff;
  border-radius: 5px;
  right: 0;
  padding: 10px;
  margin: 10px;
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
