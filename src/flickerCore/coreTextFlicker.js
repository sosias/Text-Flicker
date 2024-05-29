import { useUiStore } from '@/stores/ui'
    
const sketch = (function() {
  let context
  let store
  let lastTimeIncremented = 0
  let running = false
  let fitFontSize = 100

  const incrementIndexIfTime = (millisecondStep) => {
    if (lastTimeIncremented + millisecondStep < Date.now()) {
      lastTimeIncremented = Date.now()
      store.wordIndex++
      if (store.wordIndex >= Object.keys(store.wordList[store.scene].data).length) {
        store.wordIndex = 0
        setLoopStatus(false)
        clear()
      }
      return true
    }
    return false
  }

  const getFontSizeOfFittedText = (text, fontsize, fitX, fitY) => {
    context.font = `${fontsize}px 'din-bold'`;
    return Math.min(fitX / context.measureText(text).width * fontsize, fitY)
  }
  
  const fittedText = (text, fontsize, fitX, fitY) => {
    context.font = `${fontsize}px 'din-bold'`;
    fontsize = getFontSizeOfFittedText(text, fontsize, fitX, fitY)
    context.font = `${fontsize}px 'din-bold'`;
  }

  const calculateCurrentFontSize = () => {
    let fitFontSizeReference = "Normalerweise"
    fitFontSize = getFontSizeOfFittedText(fitFontSizeReference, fitFontSize, context.canvas.width - 30, context.canvas.height)
  }

  const drawWord = (text, x, y, color, fontsize, fitted=false) => {
    context.fillStyle = color;
    context.font = `${fontsize}px 'din-bold'`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if(fitted){fittedText(text, fontsize, context.canvas.width - 30, context.canvas.height)}
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
      lastTimeIncremented = Date.now()
      mainLoop()
    }else{
      running = false
    }
    store.isPlaying = start
  }

  const clear = () => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
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
    calculateCurrentFontSize()

    store.setWordlistLoopStatus = setLoopStatus
    store.clear = clear
    store.drawOnce = draw

    window.requestAnimationFrame(mainLoop)
    if(store.wordList){draw()}
  }

  const mainLoop = () => {
      if(store.wordList){
        draw()

        let stepMillisecondsMod = store.wordList[store.scene].data[store.wordIndex].staying == ''
        ? store.stepMilliseconds
        : store.stepMilliseconds * store.wordList[store.scene].data[store.wordIndex].staying
        incrementIndexIfTime(stepMillisecondsMod)
      }

      if(running){
        window.requestAnimationFrame(mainLoop)
      }
  }

  const draw = () => {
    // context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    context.fillStyle = '#0002';
    context.rect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();

    const color = store.wordList[store.scene].data[store.wordIndex].color ?? 'white'
    if(store.blur){
      context.filter = 'drop-shadow(0 0 50px #fff)';
      drawWordsPolymorph(store.wordList[store.scene].data[store.wordIndex].text, context.canvas.clientWidth / 2, context.canvas.clientHeight / 2, color, fitFontSize, store.fittedText)
      context.filter = 'blur(0px)';
    }
    drawWordsPolymorph(store.wordList[store.scene].data[store.wordIndex].text, context.canvas.clientWidth / 2, context.canvas.clientHeight / 2, color, fitFontSize, store.fittedText)
  }

  const windowResized = (event) => {
    context.canvas.width = window.innerWidth
    context.canvas.height = window.innerHeight
    calculateCurrentFontSize()
  }

  return {
    init: init,
  }
})()

export const textFlickerMain = (node) => {
    sketch.init(node)
}
