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


onMounted(() => {
  fetchWords();
    document.addEventListener('keyup', userReleaseKey, true)
})

onBeforeUnmount(() => {
    document.removeEventListener('keyup', userReleaseKey, true)
})

const fetchWords = async() => {
  try {
    const response = await fetch('/data/wordlist.json');
    store.wordList  = await response.json();
  } catch (error) {
    console.error(error);
  }
}

</script>

<template>
  <div class="container" v-if="isVisible">
    <section>
      <button class="button" v-on:click="isVisible = false">hide</button><span>shortcut 'h' toggle panel</span>
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
      <div v-for="(wordItem, index) in store.wordList" :key="index">
        <UIWordItem :on="index==store.wordIndex" :text=wordItem.text :staying=parseInt(wordItem.staying) />
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
