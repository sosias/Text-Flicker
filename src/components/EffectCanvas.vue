<script setup>
  import { onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useUiStore } from '@/stores/ui'
  import { EffectType } from '../lib/effectCanvasHelper'

  const store = useUiStore()

  const canvas = ref("canvas")
  let gl
  let resolutionLocation
  store.fxPlaying = true
  let animationTimeBegin = -1
  const animationDuration = 30 // seconds
  
  onMounted(() => {
    initWebGL()
    window.addEventListener("resize", resize);
  })

  onUnmounted(() => {
    window.removeEventListener("resize", resize);
  })

  const updateFxDivergence = (currentTime) => {
    if(animationTimeBegin == -1) { animationTimeBegin = currentTime}
    store.fx_divergence = (currentTime - animationTimeBegin) / animationDuration;
    if(store.fx_divergence >= 1.0){
      store.fx_sequencePlaying = false
      animationTimeBegin = -1
    }
  }

  const resize = (e) => {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight

    gl.uniform2f(resolutionLocation, canvas.value.width, canvas.value.height);
  }

  const initWebGL = () => {
    gl = canvas.value.getContext('webgl');
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight

    // Vertex shader
    const vertexShaderSource = `
    attribute vec3 position;

    void main()	{
      gl_Position = vec4(position, 1.0);
    }
    `;

    // Fragment shader, waves
    const fragmentShaderWavesSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float time;
      uniform float divergence;
      float xScale = 5.0;
      float yScale = 0.4;
      float distortion = 0.03;
      vec2 uResolutionMod = vec2(uResolution.x,uResolution.y/3.0);

      float map(float value, float min1, float max1, float min2, float max2){
        float perc = (value - min1) / (max1 - min1);
        return perc * (max2 - min2) + min2;
      }

      float remap(float value, float min2, float max2){
        return value * (max2 - min2) + min2;
      }

      float wave(float x, float amp, float waveLength, float speed) {
        //return yScale * amp * sin(x *  2.0/waveLength + time * speed * 2.0/waveLength);
        return yScale * amp * sin(time * speed + x * 2.0/waveLength);
      }

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - uResolutionMod) / min(uResolutionMod.x, uResolutionMod.y);
        
        float d = 0.0;// length(p) * 1.0; //length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float waveLength = .5;
        float speed = 6.;
        float ampRandR = 0.0 + 0.05* fract(sin(time*20.1));
        float ampRandG = 0.0 + 0.05* fract(sin(time*12.2));
        float ampRandB = 0.0 + 0.05* fract(sin(time*13.3));

        float ampR = ampRandR + divergence + (1.0-divergence)*.9;

        float r1 = wave(gx,ampR,waveLength,speed);
        //float r2 = wave(gx,ampR,waveLength + .4,speed + .1);
        float r3 = wave(gx,ampR-.5,waveLength + .2,speed * 2.0);
        float r = 0.01 / abs(p.y + r3 + r1*remap(divergence,1.0,.0));

        float ampG = ampRandG + divergence + (1.0-divergence)*.5;

        float g1 = wave(gx,ampG,waveLength,speed);
        //float g2 = wave(gx,ampG,waveLength + .4,speed + .1);
        float g3 = wave(gx,ampG+.1,waveLength + .6,speed * 2. );
        float g = 0.01 / abs(p.y + g1 + g3*remap(divergence,1.0,.0));

        float ampB = ampRandB + divergence + (1.0-divergence)*.8;

        float b1 = wave(gx,ampB,waveLength,speed);
        //float b2 = wave(gx,ampB,waveLength + .4,speed + .1);
        float b = 0.01 / abs(p.y + b1);

        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    ///////////////////////////
    // Fragment shader, cirlce
    ///////////////////////////

    const fragmentShaderCircleSource = `
    precision highp float;
    uniform float time; 
    uniform vec2 uResolution;
    vec2 uResolutionMod = vec2(uResolution.x,uResolution.y/2.0);

    #define M_PI 3.1415926535897932384626433832795
    #define M_TWO_PI (2.0 * M_PI)

    float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898,12.1414))) * 83758.5453);
    }

    float noise(vec2 n) {
        const vec2 d = vec2(0.0, 1.0);
        vec2 b = floor(n);
        vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
    }

    vec3 ramp(float t) {
      return t <= .5 ? vec3( .05, .0, 1. - t * 1.4 ) / t : vec3( .05, .0, .3 * (1. - t) * 2. ) / t;
    }
    vec2 polarMap(vec2 uv, float shift, float inner) {

        uv = vec2(0.5) - uv;
        
        
        float px = 1.0 - fract(atan(uv.y, uv.x) / 6.28 + 0.25) + shift;
        float py = (sqrt(uv.x * uv.x + uv.y * uv.y) * (1.0 + inner * 2.0) - inner) * 2.0;
        
        return vec2(px, py);
    }
    float fire(vec2 n) {
        return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
    }

    float shade(vec2 uv, float t) {
        uv.x += uv.y < .5 ? 23.0 + t * .035 : -11.0 + t * .03;    
        uv.y = abs(uv.y - .5);
        uv.x *= 35.0;
        
        float q = fire(uv - t * .013) / 2.0;
        vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
        
        return pow(abs((r.y + r.y) * max(.0, uv.y) + .1), 4.0);
    }

    vec3 color(float grad) {
        float m2 = 300.0 * 3.0 / uResolutionMod.y;
        grad =sqrt(grad);
        vec3 color = vec3(1.0 / (pow(abs(vec3(0.5, 0.0, .1) + 2.61), vec3(2.0))));
        vec3 color2 = color;
        color = ramp(grad);
        color /= (m2 + max(vec3(0), color));
        
        return color;
    }

    void main( void ) {
        float m1 = 400.0 * 5.0 / uResolutionMod.x;
        
        float t = time;
        vec2 uv = gl_FragCoord.xy / uResolutionMod.y;
        uv.y = uv.y - .5; // translate circle vertically
        float ff = 1.0 - uv.y;
        uv.x -= (uResolutionMod.x / uResolutionMod.y - 1.0) / 2.0;
        vec2 uv2 = uv;
        uv2.y = 1.0 - uv2.y;
        uv = polarMap(uv, 1.3, m1);
        uv2 = polarMap(uv2, 1.9, m1);

        vec3 c1 = color(shade(uv, t)) * ff;
        vec3 c2 = color(shade(uv2, t)) * (1.0 - ff);
        
        gl_FragColor = vec4(c1 + c2, 1.0);
    }
    `;

    const getCurrentShader = ()=>{
      if(currentEffectType == EffectType.WAVE){
        return fragmentShaderWavesSource
      }else if(currentEffectType == EffectType.CIRCLE){
        return fragmentShaderCircleSource
      }
      return fragmentShaderWavesSource
    }

    let program, positionLocation, positionBuffer, timeLocation, divergenceLocation
    let currentEffectType
    const setupWebgl = ()=>{
      // Compile shaders and link them into a program
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, getCurrentShader());
      program = createProgram(gl, vertexShader, fragmentShader);
      
      // Set up the position attribute
      positionLocation = gl.getAttribLocation(program, "position");
      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0,  1.0,
        1.0,  1.0,
      ]), gl.STATIC_DRAW);
      
      // Set up the time uniform
      timeLocation = gl.getUniformLocation(program, "time");
      divergenceLocation = gl.getUniformLocation(program, "divergence");
      resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    }
    setupWebgl()

    watch(() => store.currentEffectType, (newEffectType, oldEffectType)=>{
      currentEffectType = newEffectType
      setupWebgl()
    }, { immediate: true });
    
    // Draw the scene
    const drawScene = (time) => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeLocation, time * 0.001); // Convert time to seconds
      gl.uniform1f(divergenceLocation, store.fx_divergence);
      //console.log(time, time * 0.001)
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      if(store.fxPlaying){
        if(store.fx_sequencePlaying){updateFxDivergence(time * 0.001)}
        requestAnimationFrame(drawScene);
      }
    }
    
    requestAnimationFrame(drawScene);
  }

  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  
  const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }
</script>

<template>
  <canvas id="fx-canvas" ref="canvas"></canvas>
</template>

<style scoped>
</style>