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

const getChemicalQuantity = string => {
  const [number, chemical] = string.split(' ')
  return { number: Number(number), chemical }
}

const getNeededChemicals = request => {
  const queue = [request]
  let oreNeeded = 0

  while (queue.length) {
    const node = queue.shift()

    if (node.chemical === 'ORE') {
      oreNeeded += node.number
    } else if (node.number <= storedChemicals[node.chemical]) {
      storedChemicals[node.chemical] -= node.number
    } else {
      const numberNeeded = node.number - storedChemicals[node.chemical]
      const reaction = reactions[node.chemical]
      const proportion = Math.ceil(numberNeeded / reaction.number)

      for (const { chemical, number } of reaction.inputs) {
        queue.push({ chemical, number: number * proportion })
      }

      storedChemicals[node.chemical] = proportion * reaction.number - numberNeeded
    }
  }

  return oreNeeded
}

const reactions = {}
const storedChemicals = {}

const main = async () => {
  const reactionsList = await getInput()

  reactionsList.forEach(line => {
    const inputsList = line.includes(', ') ? line.split(', ') : [line]
    const numInputs = inputsList.length
    const lastInput = inputsList[numInputs - 1]
    const outputString = lastInput.split(' => ')[1]

    inputsList[numInputs - 1] = lastInput.substring(0, lastInput.indexOf(' => '))

    const { number, chemical } = getChemicalQuantity(outputString)

    reactions[chemical] = {
      inputs: inputsList.map(getChemicalQuantity),
      number
    }
  })

  reactions['ORE'] = { inputs: [], number: 1 }

  for (const chemical in reactions) {
    storedChemicals[chemical] = 0
  }

  const oreNeeded = getNeededChemicals({ chemical: 'FUEL', number: 1 })

  console.log(`Amount of ORE needed to produce 1 FUEL (1): ${oreNeeded}`)

  const oreCargo = 1000000000000

  let right = 0
  let left = 1

  while (left + 1 !== right) {
    const middle = right ? Math.floor((right + left) / 2) : left * 2

    getNeededChemicals({ chemical: 'FUEL', number: middle }) > oreCargo
      ? (right = middle)
      : (left = middle)
  }

  console.log(`Maximum amount of FUEL produced with 1 trillion ORE (2): ${left}`)
}

main()
