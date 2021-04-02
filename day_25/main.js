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

const key = ([prev, room, ...inv]) => [roomName(room), ...inv].join(',')

const visit = ([prev, room, ...inv]) => {
  if (!roomName(room)) return []

  const dirs = roomDirs(room)
  const items = roomItems(room).filter(r => r !== 'infinite loop' && !inv.includes(r))
  const matchPass = room.match(/\d{4,}/)

  if (matchPass) {
    return Number(matchPass[0])
  }

  return dirs
    .map(d => [...go(prev, d), ...inv])
    .concat(items.map(i => [go(prev, `take ${i}`)[0], room, ...[...inv, i].sort()]))
}

const breadthFirstSearch = init => {
  const queue = [init]
  const distanceMap = new Map([[key(init), 0]])

  while (queue.length) {
    const node = queue.shift()
    const nextNodes = visit(node)

    if (typeof nextNodes !== 'object') return nextNodes

    for (const next of nextNodes) {
      if (!distanceMap.has(key(next))) {
        const distance = distanceMap.get(key(node))
        distanceMap.set(key(next), distance + 1)
        queue.push(next)
      }
    }
  }
}

const intcodeRunner = (code, onData, input = [], pc = 0, relativeBase = 0) => {
  let outputs = []
  let intcode = code.slice()

  function* process() {
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
          intcode[intcode[pc + 1] + Number(condition1 === 2) * relativeBase] = yield
          pc += 2
          break
        case 4:
          yield param1
          pc += 2
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

  const exe = process()
  let state = exe.next()

  function run() {
    while (!state.done) {
      let curInput

      if (state.value === undefined) {
        if (!input.length) break

        curInput = input.shift()
      } else {
        outputs.push(state.value)

        if (outputs.length >= onData.length) {
          onData(...outputs)
          outputs = []
        }
      }

      state = exe.next(curInput)
    }
  }

  run()

  return {
    clone: (clonedInput, clonedOnData) =>
      intcodeRunner(intcode, clonedOnData, clonedInput, pc, relativeBase)
  }
}

const go = (prev, cmd) => {
  const cmdCodes = `${cmd}\n`.split('').map(c => c.charCodeAt(0))
  let currentRoom = ''
  const current = prev.clone(cmdCodes, r => (currentRoom += String.fromCharCode(r)))
  return [current, currentRoom]
}

const roomName = loc => {
  let matchRoom = loc.match(/== (.*?) ==/)
  return matchRoom && matchRoom[1]
}

const roomDirs = loc => {
  let matchDirs = loc.match(/lead:\n((- .*\n)+)/)
  return matchDirs ? [...matchDirs[1].matchAll(/[a-z]+/g)].map(dirs => dirs[0]) : []
}

const roomItems = loc => {
  let matchItems = loc.match(/Items here:\n((- .*\n)+)/)
  return matchItems ? [...matchItems[1].matchAll(/- (.+)/g)].map(items => items[1]) : []
}

const main = async () => {
  const input = await getInput()
  let initialIntcode = input.split(',').map(Number)

  let initRoom = ''
  const init = intcodeRunner(initialIntcode, v => (initRoom += String.fromCharCode(v)))

  const password = breadthFirstSearch([init, initRoom])

  console.log(`Password (1): ${password}`)
  console.log(`Password (2): ${password}`)
}

main()
