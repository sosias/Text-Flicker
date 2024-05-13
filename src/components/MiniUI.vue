<script setup>
import { useUiStore } from '@/stores/ui'
import { onBeforeUnmount } from 'vue';
import TheUI from "./TheUI.vue";
import playIcon from "@/assets/imgs/play.svg"
import stopIcon from "@/assets/imgs/stop.svg"
import { EffectType } from '../lib/effectCanvasHelper'

const store = useUiStore()
let closingTimeoutID;

const LoopType = Object.freeze({
    VIDEO:   Symbol("video"),
    WORDLIST:  Symbol("wordlist"),
    EFFECT:  Symbol("effect"),
})

store.currentEffectType = EffectType.WAVE
store.currentLoopType = LoopType.WORDLIST

store.isPanelUIVisible = false

const videoLoop = (start) => {
  store.setVideoLoopStatus(start)
}

const wordsLoop = (start) => {
  store.setWordlistLoopStatus(start)
  store.wordIndex = 0
}

const setLoopStatus = (start) => {
  if(store.currentLoopType == LoopType.WORDLIST){
    wordsLoop(start)
  } else if(store.currentLoopType == LoopType.VIDEO){
    videoLoop(start)
  }
  closingTimeoutID = setTimeout(() => { store.isMiniUIVisible = false }, 2000);
}

onBeforeUnmount(() => {
  clearTimeout(closingTimeoutID)
})

const changeScene = (sceneIndex) => {
  videoLoop(false)
  store.currentLoopType = LoopType.WORDLIST
  store.scene = sceneIndex
  store.wordIndex = 0
  store.drawOnce()
}

const changeSceneVideo = () => {
  wordsLoop(false)
  store.clear()
  store.currentLoopType = LoopType.VIDEO
}

const changeSceneEffect = (effectType) => {
  store.currentEffectType = effectType
  wordsLoop(false)
  store.clear()
  store.currentLoopType = LoopType.EFFECT
  store.calibration = true
  store.fx_sequencePlaying = true
}

const resetAll = () => {
  wordsLoop(false)
  store.clear()
  store.calibration = false
  store.fx_sequencePlaying = false
}

store.changeScene = changeScene
</script>

<template>
  <Transition>
    <div class="container_UI" v-if="store.isMiniUIVisible">
      <div id="miniUI">
        <section>
          <button class="button_ctrl" :disabled="store.isPlaying === true" v-on:click="setLoopStatus(true)"><img alt="play" :src=playIcon /></button>
          <button class="button_ctrl" :disabled="store.isPlaying === false" v-on:click="setLoopStatus(false)"><img alt="stop" :src=stopIcon /></button>
          <button class="button_ctrl" v-on:click="store.isPanelUIVisible=!store.isPanelUIVisible">*</button>
        </section>
        <section>
          <div v-for="(scene, index) in store.wordList" :key="index">
            <button class="button_ctrl" :disabled="index==store.scene && store.currentLoopType==LoopType.WORDLIST" v-on:click="changeScene(index)" :index=index>{{index}}</button>
          </div>
        </section>
        <section>
          <button class="button_ctrl" :disabled="store.currentLoopType==LoopType.VIDEO" v-on:click="resetAll();changeSceneVideo()">I</button>
          <button class="button_ctrl" :disabled="store.currentLoopType==LoopType.EFFECT && store.currentEffectType==EffectType.WAVE" v-on:click="changeSceneEffect(EffectType.WAVE)">II</button>
          <button class="button_ctrl" :disabled="store.currentLoopType==LoopType.EFFECT && store.currentEffectType==EffectType.CIRCLE" v-on:click="changeSceneEffect(EffectType.CIRCLE)">III</button>
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
