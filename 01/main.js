const fs = require('fs')
const readline = require('readline')

const getFuel = mass => {
  const result = Math.floor(mass / 3) - 2

  return result > 0 ? result : 0
}

const getInput = async () => {
  return new Promise(resolve => {
    const lines = [ ]

    readline.createInterface({ input: fs.createReadStream('./input.txt') })
      .on('line', line => lines.push(line))
      .on('close', () => lines.length == 1 ? resolve(lines[0]) : resolve(lines))
  })
}

const main = async () => {
  const masses = await getInput()

  let fuel = masses.map(Number).map(getFuel)
  let result = fuel.reduce((t, f) => t + f)

  console.log(`Sum of the fuel requirements (1): ${result}`)

  const totalFuel = []

  while (fuel.reduce((t, f) => t + f) != 0) {
    totalFuel.push(fuel)
    fuel = fuel.map(getFuel)
  }

  result = totalFuel.map(f => f.reduce((t, f) => t + f)).reduce((t, f) => t + f)

  console.log(`Sum of the total fuel requirements (2): ${result}`)
}

main()
