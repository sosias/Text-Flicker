<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useUiStore } from '@/stores/ui'

  const store = useUiStore()

  const videoData = ref(null)
  const videoEl = ref(null)
  let running = ref(false)

  const setVideoLoopStatus = function (start) {
    if(start){
      running.value = true
      videoEl.value.play()
    }else{
      running.value = false
      videoEl.value.pause()
      videoEl.value.currentTime = 0;
    }
    store.isPlaying = start
  }

  store.setVideoLoopStatus = setVideoLoopStatus
  
  onMounted(() => {
    loadVideofromDBEntry("1")
  })

  onUnmounted(() => {

  })

  const loadVideofromDBEntry = (idEntry) => {
  let db;
  const requestDB = indexedDB.open("textFlickerDB");
  requestDB.onerror = (event) => {
    console.error("Use of IndexedDB isn't allowed");
  };
  requestDB.onsuccess = (event) => {
    db = event.target.result;
    const objectStore = db
      .transaction(["videos"], "readonly")
      .objectStore("videos");
    const requestObj = objectStore.get(idEntry);
    requestObj.onerror = (event) => {
      // Handle errors!
    };
    requestObj.onsuccess = (event) => {
    
      const entry = event.target.result;
      videoData.value = entry.data
    };
  };
}
</script>

<template>
  <video v-show="running" ref="videoEl" muted id="videoEl" :src="videoData" type="video/mp4"></video>
</template>

<style scoped>
#videoEl {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  object-fit: cover;
}
</style>