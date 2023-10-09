import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const stepMilliseconds = ref(300)
  const doubleCount = computed(() => stepMilliseconds.value * 2)
  function increment() {
    stepMilliseconds.value++
  }

  return { stepMilliseconds, doubleCount, increment }
})
