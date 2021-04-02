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

const intcodeRunner = function* (intcode) {
  let relativeBase = 0
  let pc = 0

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
        pc += 2
        yield param1
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

const getComputers = initialIntcode => {
  const computers = [...Array(50).keys()].map(i => ({
    program: intcodeRunner(initialIntcode.split(',').map(Number)),
    queue: [i],
    output: []
  }))

  computers.forEach(c => c.program.next())

  return computers
}

const run = function* (initialIntcode, endEarly) {
  const computers = getComputers(initialIntcode)
  let idle = false
  let nat = []

  for (let i = 0; ; i++) {
    const index = i % computers.length
    const { program, queue, output } = computers[index]
    const { value } = program.next(queue[0] != null ? queue[0] : -1)

    if (value == null) {
      idle = !queue.length && index === 0 ? true : queue.length ? false : idle

      if (idle && index === computers.length - 1) {
        const [x, y] = nat
        yield y

        computers[0].queue.push(x, y)
        nat = []
        idle = false
      }

      queue.shift()
    } else {
      output.push(value)
      idle = false
    }

    if (output.length === 3) {
      const [address, x, y] = output

      if (address === 255) {
        if (endEarly) {
          return yield y
        }

        nat = [x, y]
      } else {
        computers[address].queue.push(x, y)
      }

      computers[index].output = []
    }
  }
}

const main = async () => {
  const initialIntcode = await getInput()

  console.log(`Y value of first packet to 255 (1): ${[...run(initialIntcode, true)].pop()}`)

  const natHistory = new Set()
  let y

  for (y of run(initialIntcode)) {
    if (natHistory.has(y)) break
    natHistory.add(y)
  }

  console.log(`First repeating Y value sent by NAT (2): ${y}`)
}

main()
