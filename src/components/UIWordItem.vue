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
  },
  item: {
    type: Object,
    required: true
  }
})
</script>
<template>
  <div class="row">
    <div class="feedback-main">
      <span class="feedback" :class="{ 'c-on': on }"></span>
      <div v-if="Array.isArray(item.text)">
        <div v-for="(sub,indexSub) in item.text" :key="index+'-'+indexSub">
          {{ sub }}
        </div>
      </div>
      <div v-else>
        {{ item.text }}
      </div>
    </div>
    <div class="staying">
      {{ item.staying }}
    </div>
  </div>
</template>

<style scoped>
.row{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  /* gap: 5px; */
  width: 100%;
}
.feedback-main{
  display: flex;
  gap: .5rem;
}
.feedback {
  display: block;
  background-color: #333;
  height: 1.5rem;
  width: .5rem;
}
.c-on{
  background-color: #999;
}

.staying{
  width: 3em
}
</style>
