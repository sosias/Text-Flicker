<script setup>
import { useUiStore } from '@/stores/ui'
import { onMounted } from 'vue';

const store = useUiStore()

const changeScene = (sceneIndex) => {
  store.wordIndex = 0
  store.wordScene = sceneIndex
}

const uuidv4 = () => {
 return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
 );
}

onMounted(() => {
  initWebsocketConnection();
})

let sceneName = []
let websocketAddress = "localhost:4455"
let obsSocket

const initWebsocketConnection = async() => {
  obsSocket && obsSocket.close()
  obsSocket = new WebSocket('ws://' + websocketAddress);

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
    <input v-model="websocketAddress" type="text" v-on:change="initWebsocketConnection()"/>
</template>

<style scoped>
</style>
