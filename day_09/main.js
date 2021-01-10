const fs = require('fs')
const readline = require('readline')

const getInput = async () => {
  return new Promise(resolve => {
    const lines = []

    readline
      .createInterface({ input: fs.createReadStream('input.txt') })
      .on('line', line => lines.push(line))
      .on('close', () => (lines.length === 1 ? resolve(lines[0]) : resolve(lines)))
  })
}

const process = (intcode, input) => {
  const outputs = []
  let i = 0
  let relativeBase = 0

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

const main = async () => {
  const initialIntcode = await getInput()

  let intcode = initialIntcode.split(',').map(Number)
  let outputs = process(intcode, 1)

  console.log(`BOOST keycode (1): ${outputs}`)

  intcode = initialIntcode.split(',').map(Number)
  outputs = process(intcode, 2)

  console.log(`Coordinates of the distress signal (2): ${outputs}`)
}

main()
