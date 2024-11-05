<script setup>
import { useUiStore } from '@/stores/ui'

const store = useUiStore()

let firstClick = true

const nextAndPlay = () => {
  if(!store.isPlaying && store.currentScene < store.scenes.length - 1){
    if(!firstClick){
      store.changeScene(Number(store.currentScene) + 1)
    }
    firstClick = false
    //store.setWordlistLoopStatus(true)
  }
}

</script>

<template>
    <!-- <div class="hud" v-on:click="nextAndPlay()"> -->
    <div class="hud">
      <div v-for="index in (store.currentScene!=undefined? Number(store.currentScene) + 1 : 0)" :key="index">
        <div class="hud__circle" :index=index></div>
      </div>
    </div>
</template>

<style lang="scss" scoped>
  .hud{
    position: absolute;
    z-index: 10;
    bottom: 5px;
    left: 5px;
    display: flex;
    gap: 5px;

    &__circle{
      height: 10px;
      width: 10px;
      background-color: #3f9451;
      border-radius: 10px;
    }
  }
</style>
