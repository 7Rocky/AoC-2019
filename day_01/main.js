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

const getFuel = mass => {
  const result = Math.floor(mass / 3) - 2

  return result > 0 ? result : 0
}

const sum = (t, n) => t + n

const main = async () => {
  const masses = await getInput()

  let fuel = masses.map(Number).map(getFuel)
  let result = fuel.reduce(sum)

  console.log(`Sum of the fuel requirements (1): ${result}`)

  const totalFuel = []

  while (fuel.reduce(sum)) {
    totalFuel.push(fuel)
    fuel = fuel.map(getFuel)
  }

  result = totalFuel.map(f => f.reduce(sum)).reduce(sum)

  console.log(`Sum of the total fuel requirements (2): ${result}`)
}

main()
