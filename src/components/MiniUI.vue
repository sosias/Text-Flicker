<script setup>
import { useUiStore } from '@/stores/ui'
import { ref } from 'vue'
import TheUI from "./TheUI.vue";
import playIcon from "@/assets/imgs/play.svg"
import stopIcon from "@/assets/imgs/stop.svg"

const store = useUiStore()

store.isPanelUIVisible = false
const isPlaying = ref(false)

const setLoopStatus = (start) => {
  isPlaying.value = start
  store.setLoopStatus(start)
  store.wordIndex = 0
}

const changeScene = (sceneIndex) => {
  store.scene = sceneIndex
  store.wordIndex = 0
  store.drawOnce()
}
</script>

<template>
  <Transition>
    <div class="container_UI" v-if="store.isMiniUIVisible">
      <div id="miniUI">
        <section>
          <button class="button_ctrl" :disabled="isPlaying === true" v-on:click="setLoopStatus(true)"><img alt="play" :src=playIcon /></button>
          <button class="button_ctrl" :disabled="isPlaying === false" v-on:click="setLoopStatus(false)"><img alt="stop" :src=stopIcon /></button>
          <button class="button_ctrl" v-on:click="store.isPanelUIVisible=!store.isPanelUIVisible">*</button>
        </section>
        <section>
          <div v-for="(scene, index) in store.wordList" :key="index">
            <button class="button_ctrl" :disabled="index==store.scene" v-on:click="changeScene(index)" :index=index>{{index}}</button>
          </div>
        </section>
      </div>
      <TheUI />
    </div>
  </Transition>
</template>

<style scoped>
.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from, .v-leave-to {
  opacity: 0;
}

.container_UI{
  position: absolute;
  right: 0;
  margin: 10px;
  width: 100%;
  max-width: 400px;
}

#miniUI{
  position: absolute;
  border-radius: 5px;
  top: 0;
  right: 0;
  padding: 10px;
  padding-top: 0px;
  margin: 10px;
  z-index: 10;
}

section{
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
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

.button_ctrl img{
  height: 24px;
  width: 24px;
}
</style>
