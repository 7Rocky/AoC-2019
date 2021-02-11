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

let intcode
let i = 0
let relativeBase = 0

const process = input => {
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
        i += 2
        return param1
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

const nextPositions = point => {
  const possiblePositions = []

  const intcodeCopy = [...point.intcode]
  const iCopy = point.i
  const relativeBaseCopy = point.relativeBase

  const [x, y] = point.position.split(',').map(Number)
  const positions = [`${x},${y - 1}`, `${x},${y + 1}`, `${x - 1},${y}`, `${x + 1},${y}`]

  for (let d = 0; d < positions.length; d++) {
    intcode = [...intcodeCopy]
    i = iCopy
    relativeBase = relativeBaseCopy

    const output = process(d + 1)

    if (output === 1) {
      possiblePositions.push({ position: positions[d], intcode, i, relativeBase })
    } else if (output === 2) {
      possiblePositions.push({ position: positions[d], intcode, i, relativeBase, isTarget: true })
    }
  }

  return possiblePositions
}

const breadthFirstSearch = root => {
  const queue = [root.position]
  const visited = [root.position]

  map.set(root.position, root)

  while (queue.length) {
    const node = map.get(queue.shift())

    for (const next of nextPositions(node)) {
      if (!visited.includes(next.position)) {
        next.steps = node.steps + 1
        queue.push(next.position)
        map.set(next.position, next)
        visited.push(next.position)
      }
    }
  }
}

const map = new Map()

const main = async () => {
  const initialIntcode = await getInput()

  intcode = initialIntcode.split(',').map(Number)

  breadthFirstSearch({ position: '0,0', steps: 0, intcode, i, relativeBase })

  const oxygenSystem = Array.from(map.values()).find(value => value.isTarget)

  console.log(`Minimum number of commands to reach oxygen system (1): ${oxygenSystem.steps}`)

  map.clear()

  intcode = oxygenSystem.intcode
  i = oxygenSystem.i
  relativeBase = oxygenSystem.relativeBase

  breadthFirstSearch({ ...oxygenSystem, steps: 0 })

  const maxMinutes = Array.from(map.values())
    .map(value => value.steps)
    .sort((a, b) => a - b)
    .pop()

  console.log(`Minutes to fill map with oxygen (2): ${maxMinutes}`)
}

main()
