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
        if (outputs.length === 2) return outputs
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

const updatePosition = (position, direction, lastDirection) => {
  if (direction === 0 && lastDirection === '1i') {
    position[0]--
    return '-1'
  }

  if (direction === 0 && lastDirection === '-1') {
    position[1]++
    return '-1i'
  }

  if (direction === 0 && lastDirection === '-1i') {
    position[0]++
    return '1'
  }

  if (direction === 0 && lastDirection === '1') {
    position[1]--
    return '1i'
  }

  if (direction === 1 && lastDirection === '1i') {
    position[0]++
    return '1'
  }

  if (direction === 1 && lastDirection === '-1') {
    position[1]--
    return '1i'
  }

  if (direction === 1 && lastDirection === '-1i') {
    position[0]--
    return '-1'
  }

  if (direction === 1 && lastDirection === '1') {
    position[1]++
    return '-1i'
  }
}

const resetIntcode = () => {
  i = 0
  relativeBase = 0
}

const paint = (intcode, initialColor) => {
  resetIntcode()

  const position = [0, 0]
  let lastDirection = '1i'

  const map = { '0,0': { color: initialColor, painted: false } }

  let outputs = process(intcode, map[position.join(',')].color)

  while (outputs.length) {
    const [color, direction] = outputs

    map[position.join(',')] = { color, painted: true }
    lastDirection = updatePosition(position, direction, lastDirection)

    if (map[position.join(',')] === undefined) {
      map[position.join(',')] = { color: 0, painted: false }
    }

    outputs = process(intcode, map[position.join(',')].color)
  }

  return map
}

const getMaxDimensions = map => {
  let [minX, maxX, minY, maxY] = [Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER, 0]

  for (const position in map) {
    const [x, y] = position.split(',').map(Number)

    if (minX > x) minX = x
    if (maxX < x) maxX = x
    if (minY > y) minY = y
    if (maxY < y) maxY = y
  }

  return [minX, maxX, minY, maxY]
}

const draw = map => {
  const [minX, maxX, minY, maxY] = getMaxDimensions(map)
  const painting = []

  for (let row = minY; row <= maxY; row++) {
    painting.push('.'.repeat(maxX - minX + 1))
  }

  for (const position in map) {
    const [x, y] = position.split(',').map(Number)

    let row = painting[y - minY]

    painting[y - minY] =
      row.substring(0, x - minX) +
      (map[position].color === 0 ? '.' : '#') +
      row.substring(x - minX + 1)
  }

  for (const row of painting) {
    console.log(row)
  }
}

const main = async () => {
  const initialIntcode = await getInput()

  let intcode = initialIntcode.split(',').map(Number)
  let map = paint(intcode, 0)

  const numPainted = Object.values(map).filter(p => p.painted).length

  console.log(`Number of panels painted at least once (1): ${numPainted}`)

  intcode = initialIntcode.split(',').map(Number)
  map = paint(intcode, 1)

  console.log('Registration Identifier (2):\n')
  draw(map)
}

main()
