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
    <span class="circle" :class="{ 'c-on': on }"></span><input type="text" v-model=store.wordList[store.scene][index].text /><input class="staying" type="text" v-model=store.wordList[store.scene][index].staying />
  </div>
</template>

<style scoped>
.row{
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
}
.circle {
  display: inline-block;
  background-color: #d1d1d1;
  height: 15px;
  width: 15px;
  border-radius: 50%;
}
.c-on{
    background-color: #00abff;
  }

.staying{
  width: 3em
}
</style>
