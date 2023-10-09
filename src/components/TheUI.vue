<script setup>
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'

const store = useUiStore()
const isVisible = ref(true)

defineProps({
  msg: {
    type: String,
    required: true
  }
})

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
    document.addEventListener('keyup', userReleaseKey, true)
})

onBeforeUnmount(() => {
    document.removeEventListener('keyup', userReleaseKey, true)
})

</script>

<template>
  <div class="container" v-if="isVisible">
    <h1 class="green">{{ msg }}</h1>
    <div>
      <button v-on:click="isVisible = false">hide</button><span>shortcut 'h' toggle panel</span>
      <section>
        <input v-model.number="store.stepMilliseconds" type="range" min="1" max="1000" class="slider" />
        <input v-model="store.stepMilliseconds" type="number" /><span>ms</span>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container{
  background-color: #fff;
  border-radius: 5px;
}
</style>
