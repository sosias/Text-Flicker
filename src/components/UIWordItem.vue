<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  staying: {
    type: Number,
    required: false
  }
})
</script>
<template>
  <div class="row">
    <span class="circle"></span><input type="text" :value=text /><input class="staying" type="number" :value=staying />
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
  background-color: #00abff;
  height: 15px;
  width: 15px;
  border-radius: 50%;
}

.staying{
  width: 3em
}
</style>
