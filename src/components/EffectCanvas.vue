<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useUiStore } from '@/stores/ui'

  const store = useUiStore()

  const canvas = ref("canvas")
  let gl
  let resolutionLocation
  store.fxPlaying = true

  onMounted(() => {
     initWebGL()
     window.addEventListener("resize", resize);
  })

  onUnmounted(() => {
    window.removeEventListener("resize", resize);
  })

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

    // Fragment shader
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform float time;
      uniform float divergence;
      float xScale = 5.0;
      float yScale = 0.4;
      float distortion = 0.03;

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
        vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
        
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
        float r2 = wave(gx,ampR,waveLength + .4,speed + .1);
        float r3 = wave(gx,ampR-.5,waveLength + .2,speed * 2.0);
        float r = 0.05 / abs(p.y + r1 + r2 + r3*remap(divergence,1.0,.0));

        float ampG = ampRandG + divergence + (1.0-divergence)*.5;

        float g1 = wave(gx,ampG,waveLength,speed);
        float g2 = wave(gx,ampG,waveLength + .4,speed + .1);
        float g3 = wave(gx,ampG+.1,waveLength + .6,speed * 2. );
        float g = 0.05 / abs(p.y + g1 + g2 + g3*remap(divergence,1.0,.0));

        float ampB = ampRandB + divergence + (1.0-divergence)*.8;

        float b1 = wave(gx,ampB,waveLength,speed);
        float b2 = wave(gx,ampB,waveLength + .4,speed + .1);
        float b = 0.05 / abs(p.y + b1 + b2);

        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    // Compile shaders and link them into a program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Set up the position attribute
    const positionLocation = gl.getAttribLocation(program, "position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0,  1.0,
      1.0,  1.0,
    ]), gl.STATIC_DRAW);

    // Set up the time uniform
    const timeLocation = gl.getUniformLocation(program, "time");
    const divergenceLocation = gl.getUniformLocation(program, "divergence");
    resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    
    // Draw the scene
    const drawScene = (time) => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height/3);
      gl.uniform1f(timeLocation, time * 0.001); // Convert time to seconds
      gl.uniform1f(divergenceLocation, store.fx_divergence);
      //console.log(time, time * 0.001)
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      if(store.fxPlaying){
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