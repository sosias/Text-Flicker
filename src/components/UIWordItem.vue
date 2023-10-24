<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  staying: {
    type: Number,
    required: false
  },
  on: {
    type: Boolean,
    required: false,
    default: false
  }
})
</script>
<template>
  <div class="row">
    <span class="circle" :class="{ 'c-on': on }"></span><input type="text" :value=text /><input class="staying" type="number" :value=staying />
  </div>
</template>

<style scoped>
.row{
  display: flex;
  align-items: center;
  gap: 5px;
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
