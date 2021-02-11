const fs = require('fs')
const readline = require('readline')

const getInput = async () => {
  return new Promise(resolve => {
    const lines = []

    readline
      .createInterface({ input: fs.createReadStream('input.txt') })
      .on('line', line => lines.push(line))
      .on('close', () => resolve(lines.length === 1 ? lines[0] : lines))
  })
}

let i = 0
let relativeBase = 0

const process = (intcode, input) => {
  const outputs = []

  while (i < intcode.length) {
    const condition1 = (intcode[i] / 100).toFixed(0) % 10
    const condition2 = (intcode[i] / 1000).toFixed(0) % 10
    const condition3 = (intcode[i] / 10000).toFixed(0) % 10

    const param1 =
      condition1 === 0
        ? intcode[intcode[i + 1]] || 0
        : condition1 === 1
        ? intcode[i + 1]
        : intcode[intcode[i + 1] + relativeBase]
    const param2 =
      condition2 === 0
        ? intcode[intcode[i + 2]] || 0
        : condition2 === 1
        ? intcode[i + 2]
        : intcode[intcode[i + 2] + relativeBase]
    const param3 = intcode[i + 3] + Number(condition3 === 2) * relativeBase

    switch (intcode[i] % 100) {
      case 1:
        intcode[param3] = param1 + param2
        i += 4
        break
      case 2:
        intcode[param3] = param1 * param2
        i += 4
        break
      case 3:
        intcode[intcode[i + 1] + Number(condition1 === 2) * relativeBase] = input
        i += 2
        break
      case 4:
        outputs.push(param1)
        i += 2
        if (outputs.length === 3) return outputs
        break
      case 5:
        i = param1 !== 0 ? param2 : i + 3
        break
      case 6:
        i = param1 === 0 ? param2 : i + 3
        break
      case 7:
        intcode[param3] = Number(param1 < param2)
        i += 4
        break
      case 8:
        intcode[param3] = Number(param1 === param2)
        i += 4
        break
      case 9:
        relativeBase += param1
        i += 2
        break
      case 99:
        return outputs
    }
  }
}

const resetIntcode = () => {
  i = 0
  relativeBase = 0
}

const setTiles = intcode => {
  resetIntcode()

  const map = {}

  let outputs = process(intcode)

  while (outputs.length) {
    const [x, y, tileId] = outputs

    map[[x, y].join(',')] = tileId

    outputs = process(intcode)
  }

  return map
}

const main = async () => {
  const initialIntcode = await getInput()

  let intcode = initialIntcode.split(',').map(Number)
  let map = setTiles(intcode)

  const numBlockTiles = Object.values(map).filter(t => t === 2).length

  console.log(`Number of block tiles (1): ${numBlockTiles}`)

  intcode = initialIntcode.split(',').map(Number)
  intcode[0] = 2

  let score = 0
  let ball
  let paddle

  resetIntcode()
  let outputs = process(intcode, 0)

  while (outputs.length) {
    let nextInput = 0

    if (outputs[0] === -1 && outputs[1] === 0) {
      score = outputs[2]
    } else {
      if (outputs[2] === 3) {
        paddle = outputs.slice(0, 2)
      }

      if (outputs[2] === 4) {
        ball = outputs.slice(0, 2)
      }

      nextInput = ball && paddle ? Math.max(-1, Math.min(ball[0] - paddle[0], 1)) : 0
    }

    outputs = process(intcode, nextInput)
  }

  console.log(`Final score (2): ${score}`)
}

main()
