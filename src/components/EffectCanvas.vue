<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';

  const canvas = ref("canvas");

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
  }

  const initWebGL = () => {
    const gl = canvas.value.getContext('webgl');
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight

    // Vertex shader
    const vertexShaderSource = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      // void main() {
      //   float y = sin(time);
      //   gl_FragColor = vec4(y, y, y, 1.0);
      //   //gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
      // }

      void main() {
    gl_FragColor = vec4(
      mod(gl_FragCoord.x / 256., 1.),
      mod((gl_FragCoord.x + gl_FragCoord.y - time * 40.) / 256. , 1.),
      mod(gl_FragCoord.y / 256., 1.),
      1.
    );
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

    // Draw the scene
    function drawScene(time) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLocation, time * 0.001); // Convert time to seconds

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(drawScene);
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