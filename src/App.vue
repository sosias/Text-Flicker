<template>
  <div ref=“canvasOutlet”></div>
</template>

<script>
import { textFlickerMain } from "./coreTextFlicker.js";

export default{
  extend: textFlickerMain,
  mounted(props, ctx) {
    return {
      ...textFlickerMain(this.$refs.canvasOutlet),
    }
  }
};
</script>