<script setup>
import { useUiStore } from '@/stores/ui'
const store = useUiStore()

defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="container">
    <h1 class="green">{{ msg }}</h1>
    <div>
      <button>hide</button>
      <input v-model.number="store.stepMilliseconds" type="range" min="1" max="1000" class="slider" />
      <input v-model="store.stepMilliseconds" type="number" /><span>ms</span>
    </div>
  </div>
</template>

<style scoped>
.container{
  background-color: azure;
  border-radius: 5px;
}
</style>
