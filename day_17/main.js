const fs = require('fs')
const { version } = require('process')
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
let pc = 0
let relativeBase = 0

const process = input => {
  const outputs = []

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
        outputs.push(param1)
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
        return outputs
    }
  }
}

const findIntersections = map => {
  const intersections = []

  for (let j = 1; j < map.length - 1; j++) {
    const row = map[j]

    for (let i = 1; i < row.length - 1; i++) {
      if (
        row.substring(i - 1, i + 2) === '###' &&
        map[j - 1].charAt(i) === '#' &&
        map[j + 1].charAt(i) === '#'
      ) {
        intersections.push([i, j])
      }
    }
  }

  return intersections
}

const findRobot = map => {
  for (let j = 0; j < map.length; j++) {
    for (let i = 0; i < map[j].length; i++) {
      const view = map[j].charAt(i)

      if ('^>v<'.includes(view)) {
        return { position: [i, j], direction: view }
      }
    }
  }
}

const canMove = (robot, map) => {
  const [x, y] = robot.position

  switch (robot.direction) {
    case '^':
    case 'v':
      return map[y].charAt(x - 1) === '#' || map[y].charAt(x + 1) === '#'
    case '>':
    case '<':
      return (
        (y > 0 && map[y - 1].charAt(x) === '#') ||
        (y + 1 < map.length && map[y + 1].charAt(x) === '#')
      )
  }

  return false
}

const nextMove = (robot, map) => {
  const [x, y] = robot.position
  let instructions = ''
  let count = 0

  switch (robot.direction) {
    case '^':
      if (map[y].charAt(x - 1) === '#') {
        while (map[y].charAt(x - 1 - count) === '#') {
          count++
        }

        instructions += `L,${count},`
        robot.position[0] -= count
        robot.direction = '<'
      } else if (map[y].charAt(x + 1) === '#') {
        while (map[y].charAt(x + 1 + count) === '#') {
          count++
        }

        instructions += `R,${count},`
        robot.position[0] += count
        robot.direction = '>'
      }

      break
    case 'v':
      if (map[y].charAt(x - 1) === '#') {
        while (map[y].charAt(x - 1 - count) === '#') {
          count++
        }

        instructions += `R,${count},`
        robot.position[0] -= count
        robot.direction = '<'
      } else if (map[y].charAt(x + 1) === '#') {
        while (map[y].charAt(x + 1 + count) === '#') {
          count++
        }

        instructions += `L,${count},`
        robot.position[0] += count
        robot.direction = '>'
      }

      break
    case '>':
      if (y > 0 && map[y - 1].charAt(x) === '#') {
        while (y - 1 - count >= 0 && map[y - 1 - count].charAt(x) === '#') {
          count++
        }

        instructions += `L,${count},`
        robot.position[1] -= count
        robot.direction = '^'
      } else if (y + 1 < map.length && map[y + 1].charAt(x) === '#') {
        while (y + 1 + count < map.length && map[y + 1 + count].charAt(x) === '#') {
          count++
        }

        instructions += `R,${count},`
        robot.position[1] += count
        robot.direction = 'v'
      }

      break
    case '<':
      if (y > 0 && map[y - 1].charAt(x) === '#') {
        while (y - 1 - count >= 0 && map[y - 1 - count].charAt(x) === '#') {
          count++
        }

        instructions += `R,${count},`
        robot.position[1] -= count
        robot.direction = '^'
      } else if (y + 1 < map.length && map[y + 1].charAt(x) === '#') {
        while (y + 1 + count < map.length && map[y + 1 + count].charAt(x) === '#') {
          count++
        }

        instructions += `L,${count},`
        robot.position[1] += count
        robot.direction = 'v'
      }

      break
  }

  return instructions
}

const findPath = map => {
  const robot = findRobot(map)
  let path = ''

  while (canMove(robot, map)) {
    path += nextMove(robot, map)
  }

  return path
}

const main = async () => {
  const initialIntcode = await getInput()

  intcode = initialIntcode.split(',').map(Number)

  const asciiCodes = process()
  const map = []
  let row = ''

  for (const c of asciiCodes) {
    if (c !== 10) {
      row += String.fromCharCode(c)
    } else {
      map.push(row)
      row = ''
    }
  }

  const intersections = findIntersections(map)
  const result = intersections.map(([x, y]) => x * y).reduce((t, n) => t + n)

  console.log(`Sum of the alignment parameters (1): ${result}`)

  const path = findPath(map)

  let [A, B, C] = path
    .match(/^(.{1,20}),(?:\1,)*(.{1,20}),(?:\1,|\2,)*(.{1,20}),(?:\1,|\2,|\3,)*$/)
    .slice(1, 5)

  let mainRoutine = path
    .replace(new RegExp(A, 'g'), 'A')
    .replace(new RegExp(B, 'g'), 'B')
    .replace(new RegExp(C, 'g'), 'C')

  mainRoutine = mainRoutine.slice(0, mainRoutine.length - 1) + String.fromCharCode(10)
  A += String.fromCharCode(10)
  B += String.fromCharCode(10)
  C += String.fromCharCode(10)

  intcode = initialIntcode.split(',').map(Number)
  pc = 0
  relativeBase = 0
  intcode[0] = 2

  process(mainRoutine.split('').map(c => c.charCodeAt(0)))
  process(A.split('').map(c => c.charCodeAt(0)))
  process(B.split('').map(c => c.charCodeAt(0)))
  process(C.split('').map(c => c.charCodeAt(0)))

  const dust = process(['y'.charCodeAt(0), 10]).pop()

  console.log(`Dust collected (2): ${dust}`)
}

main()
