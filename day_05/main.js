const fs = require('fs')
const readline = require('readline')

const getInput = async () => {
  return new Promise(resolve => {
    const lines = []

    readline
      .createInterface({ input: fs.createReadStream('./input.txt') })
      .on('line', line => lines.push(line))
      .on('close', () => (lines.length === 1 ? resolve(lines[0]) : resolve(lines)))
  })
}

const process = (intcode, input) => {
  const outputs = []
  let i = 0

  while (i < intcode.length) {
    const param1 = (intcode[i] / 100).toFixed(0) % 10 ? intcode[i + 1] : intcode[intcode[i + 1]]
    const param2 = (intcode[i] / 1000).toFixed(0) % 10 ? intcode[i + 2] : intcode[intcode[i + 2]]

    switch (intcode[i] % 100) {
      case 1:
        intcode[intcode[i + 3]] = param1 + param2
        i += 4
        break
      case 2:
        intcode[intcode[i + 3]] = param1 * param2
        i += 4
        break
      case 3:
        intcode[intcode[i + 1]] = input
        i += 2
        break
      case 4:
        outputs.push(param1)
        i += 2
        break
      case 5:
        i = param1 ? param2 : i + 3
        break
      case 6:
        i = param1 ? i + 3 : param2
        break
      case 7:
        intcode[intcode[i + 3]] = Number(param1 < param2)
        i += 4
        break
      case 8:
        intcode[intcode[i + 3]] = Number(param1 === param2)
        i += 4
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

  console.log(`Output of Intcode (1): ${outputs.pop()}`)

  intcode = initialIntcode.split(',').map(Number)
  outputs = process(intcode, 5)

  console.log(`Output of Intcode (2): ${outputs.pop()}`)
}

main()
