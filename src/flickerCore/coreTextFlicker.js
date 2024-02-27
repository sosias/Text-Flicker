import p5 from 'p5'
import { useUiStore } from '@/stores/ui'

const sketch = function (p) {
  const store = useUiStore()

  let font
  store.scene = 0
  store.wordIndex = 0
  let lastTimeIncremented = 0
  //let audioClick = []

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
    p.textSize(p.min((fontsize * fitX) / p.textWidth(text), fitY))
  }
  
  const drawWord = (text, x, y, color, fontsize, fitted=false) => {
    p.fill(color)
    p.textSize(fontsize)
    p.textAlign(p.CENTER, p.CENTER)
    if(fitted){fittedText(text, fontsize, x, y, p.width - 30, p.height)}
    p.text(text, x, y)
  }

  const drawWordsPolymorph = (text, x, y, color, fontsize, fitted=false) => {
    if(Array.isArray(text)){
      p.textSize(fontsize)
      text.forEach((element,index) => {
        drawWord(element, x, y + ((p.textAscent() + p.textDescent()) * index), color, fontsize, fitted)
      });
    }else{
      drawWord(text, x, y, color, fontsize, fitted)
    }
  }

  p.preload = function () {
    font = p.loadFont(import.meta.env.BASE_URL + 'font/D-DIN-Bold.otf')
    // audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
    // audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
    // audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
    // audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
  }

  const setLoopStatus = function (start) {
    if(start){
      p.loop()
    }else{
      p.noLoop()
    }
  }

  p.setup = function () {
    lastTimeIncremented = Date.now()
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noStroke()
    p.textFont(font)
    p.noLoop()
    store.setLoopStatus = setLoopStatus
    store.drawOnce = p.draw
  }

  p.draw = function () {
    p.background(0)
    const color = p.color('white')
    let stepMillisecondsMod =
      store.wordList[store.scene][store.wordIndex].staying == ''
        ? store.stepMilliseconds
        : store.stepMilliseconds * store.wordList[store.scene][store.wordIndex].staying
    incrementIndexIfTime(stepMillisecondsMod + p.random(0, store.randomOffset))
    // if (incrementIndexIfTime(stepMillisecondsMod + p.random(0, store.randomOffset))) {
    //   for (let i = 0; i < audioClick.length; i++) {
    //     if (audioClick[i].paused) {
    //       audioClick[i].play()
    //       break
    //     }
    //   }
    // }
    if(store.blur){
      p.drawingContext.filter = 'drop-shadow(0 0 50px #fff)';
      drawWordsPolymorph(store.wordList[store.scene][store.wordIndex].text, p.width / 2, p.height / 2, color, 100, store.fittedText)
      p.drawingContext.filter = 'blur(0px)';
    }
    drawWordsPolymorph(store.wordList[store.scene][store.wordIndex].text, p.width / 2, p.height / 2, color, 100, store.fittedText)
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

export const textFlickerMain = (node) => {
  new p5(sketch, node)
}
