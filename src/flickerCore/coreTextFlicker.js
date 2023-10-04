import p5 from 'p5'

const sketch = function (p) {
  let font
  let wordList = []
  let wordIndex = 0
  let lastTimeIncremented = 0

  const incrementIndexIfTime = (millisecondStep) => {
    if (lastTimeIncremented + millisecondStep < Date.now()) {
      lastTimeIncremented = Date.now()
      wordIndex++

      if (wordIndex >= Object.keys(wordList).length) {
        wordIndex = 0
      }
    }
  }

  const drawWord = (x, y, color, fontsize) => {
    p.fill(color)
    p.textSize(fontsize)
    p.textAlign(p.CENTER, p.CENTER)
    p.text(wordList[wordIndex], x, y)
  }

  p.preload = function () {
    font = p.loadFont('/font/visbycf-heavy.otf')
    wordList = p.loadJSON('/data/wordlist.json')
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
    drawWord(p.width / 2, p.height / 2, color, 100)
    incrementIndexIfTime(300)
  }
}

export const textFlickerMain = (node) => {
  new p5(sketch, node)
}
