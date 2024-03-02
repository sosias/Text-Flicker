import { useUiStore } from '@/stores/ui'
    
const sketch = (function() {
  let context
  let store
  let lastTimeIncremented = 0
  let running = false

  const incrementIndexIfTime = (millisecondStep) => {
    if (lastTimeIncremented + millisecondStep < Date.now()) {
      lastTimeIncremented = Date.now()
      store.wordIndex++
      if (store.wordIndex >= Object.keys(store.wordList[store.scene]).length) {
        store.wordIndex = 0
      }
      return true
    }
    return false
  }

  const fittedText = (text, fontsize, posX, posY, fitX, fitY) => {
    fontsize = Math.min(fitX / context.measureText(text).width * fontsize, fitY)
    context.font = `${fontsize}px 'din-bold'`;
  }

  const drawWord = (text, x, y, color, fontsize, fitted=false) => {
    context.fillStyle = color;
    context.font = `${fontsize}px 'din-bold'`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if(fitted){fittedText(text, fontsize, x, y, context.canvas.width - 30, context.canvas.height)}
    context.fillText(text, x, y);
  }

  const drawWordsPolymorph = (text, x, y, color, fontsize, fitted=false) => {
    if(Array.isArray(text)){
      context.font = `${fontsize}px 'din-bold'`;
      text.forEach((element,index) => {
        drawWord(element, x, y + (context.measureText(text).actualBoundingBoxAscent * 2 * index), color, fontsize, fitted)
      });
    }else{
      drawWord(text, x, y, color, fontsize, fitted)
    }
  }

  const setLoopStatus = function (start) {
    if(start){
      running = true
      mainLoop()
    }else{
      running = false
    }
  }

  const init = (node) => {
    store = useUiStore()
    store.scene = 0
    store.wordIndex = 0
    lastTimeIncremented = Date.now()

    let canvas = document.createElement('canvas')
    node.appendChild(canvas)
    context = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.onresize = windowResized

    store.setLoopStatus = setLoopStatus
    store.drawOnce = draw

    window.requestAnimationFrame(mainLoop)
    if(store.wordList){draw()}
  }

  const mainLoop = () => {
      if(store.wordList){draw()}

      if(running){
        window.requestAnimationFrame(mainLoop)
      }
  }

  const draw = () => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    let stepMillisecondsMod = store.wordList[store.scene][store.wordIndex].staying == ''
    ? store.stepMilliseconds
    : store.stepMilliseconds * store.wordList[store.scene][store.wordIndex].staying
    incrementIndexIfTime(stepMillisecondsMod)

    const color = 'white'
    if(store.blur){
      context.filter = 'drop-shadow(0 0 50px #fff)';
      drawWordsPolymorph(store.wordList[store.scene][store.wordIndex].text, context.canvas.clientWidth / 2, context.canvas.clientHeight / 2, color, 100, store.fittedText)
      context.drawingContext.filter = 'blur(0px)';
    }
    drawWordsPolymorph(store.wordList[store.scene][store.wordIndex].text, context.canvas.clientWidth / 2, context.canvas.clientHeight / 2, color, 100, store.fittedText)
  }

  const windowResized = (event) => {
    context.canvas.width = window.innerWidth
    context.canvas.height = window.innerHeight
  }

  return {
    init: init,
  }
})()

export const textFlickerMain = (node) => {
    sketch.init(node)
}
