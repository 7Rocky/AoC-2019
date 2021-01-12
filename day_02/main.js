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

const process = intcode => {
  for (let i = 0; i < intcode.length; i += 4) {
    switch (intcode[i]) {
      case 1:
        intcode[intcode[i + 3]] = intcode[intcode[i + 1]] + intcode[intcode[i + 2]]
        break
      case 2:
        intcode[intcode[i + 3]] = intcode[intcode[i + 1]] * intcode[intcode[i + 2]]
        break
      case 99:
        return intcode[0]
    }
  }
}

const main = async () => {
  const initialIntcode = await getInput()

  let intcode = initialIntcode.split(',').map(Number)
  intcode[1] = 12
  intcode[2] = 2

  let output = process(intcode)

  console.log(`First position of Intcode (1): ${output}`)

  const target = 19690720

  let noun
  let verb

  for (noun = 0; noun < 99; noun++) {
    for (verb = 0; verb < 99; verb++) {
      intcode = initialIntcode.split(',').map(Number)
      intcode[1] = noun
      intcode[2] = verb

      output = process(intcode)

      if (output === target) break
    }

    if (output === target) break
  }

  console.log(`100 * noun + verb (2): ${100 * noun + verb}`)
}

main()

module.exports = main
