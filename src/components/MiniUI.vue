<script setup>
import { useUiStore } from '@/stores/ui'
import { ref } from 'vue'
import TheUI from "./TheUI.vue";

const store = useUiStore()

store.isPanelUIVisible = false
const isPlaying = ref(false)

const setLoopStatus = (start) => {
  isPlaying.value = start
  store.setLoopStatus(start)
}
</script>

<template>
  <div class="container" v-if="store.isMiniUIVisible">
    <section>
      <button class="button_ctrl" :disabled="isPlaying === true" v-on:click="setLoopStatus(true)">⏵</button>
      <button class="button_ctrl" :disabled="isPlaying === false" v-on:click="setLoopStatus(false)">⏹</button>
      <button class="button_ctrl" v-on:click="store.isPanelUIVisible=!store.isPanelUIVisible">*</button>
    </section>
    <TheUI />
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
  z-index: 10;
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
