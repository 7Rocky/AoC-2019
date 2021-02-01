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

const fft = input => {
  const output = []
  const pattern = [0, 1, 0, -1]

  for (let i = 0; i < input.length; i++) {
    let result = 0

    for (let j = 0; j < input.length; j++) {
      result += input[j] * pattern[Math.floor((j + 1) / (i + 1)) % pattern.length]
    }

    output.push(Math.abs(result) % 10)
  }

  return output
}

const enhancedFft = input => {
  const output = []
  let sum = input.reduce((t, n) => t + n)

  for (let i = 0; i < input.length; i++) {
    output.push(Math.abs(sum) % 10)
    sum -= input[i]
  }

  return output
}

const main = async () => {
  let list = await getInput()
  let numbers = list.split('').map(Number)

  for (let phase = 0; phase < 100; phase++) {
    numbers = fft(numbers)
  }

  console.log(`First eight digits (1): ${numbers.slice(0, 8).join('')}`)

  const messageOffset = Number(list.substring(0, 7))

  list = list.repeat(10000)
  numbers = list.split('').map(Number).slice(messageOffset)

  for (let phase = 0; phase < 100; phase++) {
    numbers = enhancedFft(numbers)
  }

  console.log(`Eight-digit message (2): ${numbers.slice(0, 8).join('')}`)
}

main()
