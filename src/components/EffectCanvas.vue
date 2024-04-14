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
      float xScale = 5.0;
      float yScale = 0.4;
      float distortion = 0.03;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale * fract(sin(time*0.2)*1.0)) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale * fract(sin(time*0.2)*1.0)) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale * fract(sin(time*0.2)*1.0)) * yScale);
        
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
      
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(timeLocation, time * 0.001); // Convert time to seconds
      
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