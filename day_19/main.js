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

let initialIntcode
let intcode
let pc
let relativeBase

const reset = () => {
  intcode = initialIntcode.split(',').map(Number)
  pc = 0
  relativeBase = 0
}

const process = input => {
  reset()
  let output

  while (pc < intcode.length) {
    const condition1 = (intcode[pc] / 100).toFixed(0) % 10
    const condition2 = (intcode[pc] / 1000).toFixed(0) % 10
    const condition3 = (intcode[pc] / 10000).toFixed(0) % 10

    const param1 =
      condition1 === 0
        ? intcode[intcode[pc + 1]] || 0
        : condition1 === 1
        ? intcode[pc + 1]
        : intcode[intcode[pc + 1] + relativeBase]
    const param2 =
      condition2 === 0
        ? intcode[intcode[pc + 2]] || 0
        : condition2 === 1
        ? intcode[pc + 2]
        : intcode[intcode[pc + 2] + relativeBase]
    const param3 = intcode[pc + 3] + Number(condition3 === 2) * relativeBase

    switch (intcode[pc] % 100) {
      case 1:
        intcode[param3] = param1 + param2
        pc += 4
        break
      case 2:
        intcode[param3] = param1 * param2
        pc += 4
        break
      case 3:
        if (!input.length) return outputs
        intcode[intcode[pc + 1] + Number(condition1 === 2) * relativeBase] = input.shift()
        pc += 2
        break
      case 4:
        pc += 2
        output = param1
        break
      case 5:
        pc = param1 !== 0 ? param2 : pc + 3
        break
      case 6:
        pc = param1 === 0 ? param2 : pc + 3
        break
      case 7:
        intcode[param3] = Number(param1 < param2)
        pc += 4
        break
      case 8:
        intcode[param3] = Number(param1 === param2)
        pc += 4
        break
      case 9:
        relativeBase += param1
        pc += 2
        break
      case 99:
        return output
    }
  }
}

const sum = (t, n) => t + n

const main = async () => {
  initialIntcode = await getInput()

  const states = []

  for (let y = 0; y < 50; y++) {
    const row = []

    for (let x = 0; x < 50; x++) {
      row.push(process([x, y]))
    }

    states.push(row)
  }

  console.log(`Number of points affected (1): ${states.map(r => r.reduce(sum)).reduce(sum)}`)

  let position = []

  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      if (states[y][x] && y > 10 && x > 20) {
        position = [x, y]
        break
      }
    }

    if (position.length) break
  }

  while (true) {
    let valid = true

    for (let dx = 0; dx < 100; dx++) {
      if (process([position[0] + dx, position[1]]) === 0) {
        valid = false
        break
      }
    }

    if (!valid) {
      position[1]++

      while (process([position[0], position[1]]) === 0) {
        position[0]++
      }

      continue
    }

    valid = true

    for (let dy = 0; dy < 100; dy++) {
      if (process([position[0], position[1] + dy]) === 0) {
        valid = false
        break
      }
    }

    if (!valid) {
      position[0]++

      while (process([position[0], position[1]]) === 0) {
        position[1]++
      }

      continue
    }

    break
  }

  console.log(`Value for the top-left corner of the ship (2): ${position[0] * 10000 + position[1]}`)
}

main()
