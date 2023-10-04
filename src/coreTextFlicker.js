import p5 from 'p5'

const sketch = function (p) {
  const drawWord = (x, y, color, fontsize) => {
    p.fill(color)
    p.textSize(fontsize)
    p.textAlign(p.CENTER, p.CENTER)
    p.text('TEST', x, y)
  }

  p.setup = function () {
    p.createCanvas(420, 420)
    p.noLoop()
    p.noStroke()
  }

  p.draw = function () {
    p.background(0)
    const color = p.color('white')
    drawWord(p.width / 2, p.height / 2, color, 40)
  }
}

export const textFlickerMain = (node) => {
  new p5(sketch, node)
}
