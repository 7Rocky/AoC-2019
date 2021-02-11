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

const process = (intcode, inputs, loopMode = false, i = 0) => {
  const outputs = []

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
        intcode[intcode[i + 1]] = inputs.shift()
        i += 2
        break
      case 4:
        outputs.push(param1)
        i += 2
        if (loopMode) return { index: i, outputs, intcode }
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
        if (loopMode) return { index: intcode.length, outputs, intcode: [] }
        return outputs
    }
  }
}

const permute = (input, permArr = [], usedNumbers = []) => {
  for (let i = 0; i < input.length; i++) {
    let numbers = input.splice(i, 1)[0]
    usedNumbers.push(numbers)

    if (!input.length) permArr.push(usedNumbers.slice())

    permute(input, permArr, usedNumbers)
    input.splice(i, 0, numbers)
    usedNumbers.pop()
  }

  return permArr
}

const copy = orig => {
  const dest = []

  for (const a of orig) dest.push(a)

  return dest
}

const main = async () => {
  const initialIntcode = await getInput()

  let intcode = initialIntcode.split(',').map(Number)
  let maxOutput = 0

  for (const phases of permute([0, 1, 2, 3, 4])) {
    let outputs = [0]

    for (let i = 0; i < 5; i++) {
      const inputs = [phases.shift(), outputs.shift()]
      outputs = process(intcode, inputs)
    }

    if (maxOutput < outputs[0]) maxOutput = outputs[0]
  }

  console.log(`Highest signal sent to thrusters (1): ${maxOutput}`)

  maxOutput = 0
  let toThrustlers = []

  for (const phases of permute([5, 6, 7, 8, 9])) {
    let intcodeA = intcode,
      intcodeB = intcode,
      intcodeC = intcode,
      intcodeD = intcode,
      intcodeE = intcode,
      inputsA = [phases.shift()],
      inputsB = [phases.shift()],
      inputsC = [phases.shift()],
      inputsD = [phases.shift()],
      inputsE = [phases.shift()],
      outputsA = [],
      outputsB = [],
      outputsC = [],
      outputsD = [],
      outputsE = [],
      indexA = 0,
      indexB = 0,
      indexC = 0,
      indexD = 0,
      indexE = 0,
      result = {}

    while (indexE < intcode.length) {
      inputsA.push(outputsE && outputsE.length ? outputsE.shift() : 0)
      result = process(intcodeA, inputsA, true, indexA)
      indexA = result.index
      intcodeA = copy(result.intcode)
      outputsA = result.outputs

      inputsB.push(outputsA.shift())
      result = process(intcodeB, inputsB, true, indexB)
      indexB = result.index
      intcodeB = copy(result.intcode)
      outputsB = result.outputs

      inputsC.push(outputsB.shift())
      result = process(intcodeC, inputsC, true, indexC)
      indexC = result.index
      intcodeC = copy(result.intcode)
      outputsC = result.outputs

      inputsD.push(outputsC.shift())
      result = process(intcodeD, inputsD, true, indexD)
      indexD = result.index
      intcodeD = copy(result.intcode)
      outputsD = result.outputs

      inputsE.push(outputsD.shift())
      result = process(intcodeE, inputsE, true, indexE)
      indexE = result.index
      intcodeE = copy(result.intcode)
      outputsE = result.outputs

      if (outputsE.length) toThrustlers.push(outputsE[0])
    }
  }

  for (const signal of toThrustlers) {
    if (maxOutput < signal) maxOutput = signal
  }

  console.log(`Highest signal sent to thrusters (2): ${maxOutput}`)
}

main()
