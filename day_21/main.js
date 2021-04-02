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
}

const springdroidExecute = instr => {
  let output = ''

  intcodeRunner(
    initialIntcode.split(',').map(Number),
    v => (output += v < 127 ? String.fromCharCode(v) : `${v}`),
    instr.split('').map(c => c.charCodeAt(0))
  )

  return output.match(/\d+/)[0]
}

let initialIntcode

const main = async () => {
  initialIntcode = await getInput()

  let instr = `NOT C J
NOT B T
OR T J
NOT A T
OR T J
AND D J
WALK
`

  console.log(`Hull damage (1): ${springdroidExecute(instr)}`)

  instr = `NOT E T
NOT H J
AND T J
NOT J J
NOT C T
AND T J
NOT B T
OR T J
NOT A T
OR T J
AND D J
RUN
`

  console.log(`Hull damage (2): ${springdroidExecute(instr)}`)
}

main()
