<script setup>
import { useUiStore } from '@/stores/ui'
const store = useUiStore()

defineProps({
  on: {
    type: Boolean,
    required: false,
    default: false
  },
  index: {
    type: Number,
    required: true
  }
})
</script>
<template>
  <div class="row">
    <span class="circle" :class="{ 'c-on': on }"></span>
    <input :key=index v-if="!Array.isArray(store.wordList[store.scene][index].text)" type="text" v-model=store.wordList[store.scene][index].text />
    <div v-else>
      <input :key="index+'-'+indexSub" v-for="(a,indexSub) in store.wordList[store.scene][index].text" type="text" v-model=store.wordList[store.scene][index].text[indexSub] />
    </div>
    <input class="staying" type="text" v-model=store.wordList[store.scene][index].staying />
  </div>
</template>

<style scoped>
.row{
  display: flex;
  align-items: top;
  /* gap: 5px; */
  width: 100%;
}

input{
  margin: 1px 5px;
}
.circle {
  display: block;
  background-color: #d1d1d1;
  height: 10px;
  width: 100%;
  max-width: 10px;
}
.c-on{
    background-color: #00abff;
  }

.staying{
  width: 3em
}
</style>
