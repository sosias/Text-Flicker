<script>
import { textFlickerMain } from "./flickerCore/coreTextFlicker.js";
import TheUI from "./components/TheUI.vue";

export default{
    extend: textFlickerMain,
    mounted(props, ctx) {
        return {
            ...textFlickerMain(this.$refs.canvasOutlet),
        };
    },
    components: { TheUI }
};
</script>

<template>
  <div ref=“canvasOutlet”></div>
  <div>aaa</div>
  <TheUI msg="aaa" />
</template>

<style lang="scss">
#app{
  position: absolute;
}
</style>