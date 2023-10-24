import p5 from 'p5'
import { useUiStore } from '@/stores/ui'

const sketch = function (p) {
  const store = useUiStore()

  let font
  //store.wordList = []
  store.wordIndex = 0
  let lastTimeIncremented = 0
  let audioClick = []

  const incrementIndexIfTime = (millisecondStep) => {
    if (lastTimeIncremented + millisecondStep < Date.now()) {
      lastTimeIncremented = Date.now()
      store.wordIndex++

      if (store.wordIndex >= Object.keys(store.wordList).length) {
        store.wordIndex = 0
      }

      return true
    }
    return false
  }

  const fittedText = (text, fontsize, posX, posY, fitX, fitY) => {
    p.textSize(p.min((fontsize * fitX) / p.textWidth(text), fitY))
    p.text(text, posX, posY)
  }

  const drawWord = (text, x, y, color, fontsize) => {
    p.fill(color)
    p.textSize(fontsize)
    p.textAlign(p.CENTER, p.CENTER)
    fittedText(text, fontsize, x, y, p.width - 30, p.height)
  }

  p.preload = function () {
    font = p.loadFont(import.meta.env.BASE_URL + 'font/D-DIN-Bold.otf')
    //store.wordList = p.loadJSON('/data/wordlist.json')
    audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
    audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
    audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
    audioClick.push(new Audio(import.meta.env.BASE_URL + 'audio/click.mp3'))
  }

  p.setup = function () {
    lastTimeIncremented = Date.now()
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noStroke()
    p.textFont(font)
  }

  p.draw = function () {
    p.background(0)
    const color = p.color('white')
    let stepMillisecondsMod =
      store.wordList[store.wordIndex].staying == ''
        ? store.stepMilliseconds
        : store.stepMilliseconds * store.wordList[store.wordIndex].staying
    if (incrementIndexIfTime(stepMillisecondsMod + p.random(0, store.randomOffset))) {
      for (let i = 0; i < audioClick.length; i++) {
        if (audioClick[i].paused) {
          audioClick[i].play()
          break
        }
      }
    }
    drawWord(store.wordList[store.wordIndex].text, p.width / 2, p.height / 2, color, 100)
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

export const textFlickerMain = (node) => {
  new p5(sketch, node)
}
