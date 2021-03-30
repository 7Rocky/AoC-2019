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

const dealIntoNewStack = conv => (cardPosition = numCards - cardPosition - conv(1))
const undealIntoNewStack = dealIntoNewStack
const cut = n => (cardPosition = (cardPosition - n) % numCards)
const uncut = n => cut(-n)
const dealWithIncrement = n => (cardPosition = (cardPosition * n) % numCards)
const undealWithIncrement = n => dealWithIncrement(inv(n, numCards))

const genericTechnique = (technique, f, g, h, conv) => {
  if (technique.includes('deal into new stack')) {
    f(conv)
  } else if (technique.includes('cut')) {
    const n = conv(technique.substring('cut '.length))
    g(n)
  } else if (technique.includes('deal with increment ')) {
    const n = conv(technique.substring('deal with increment '.length))
    h(n)
  }
}

const matchTechnique = technique =>
  genericTechnique(technique, dealIntoNewStack, cut, dealWithIncrement, Number)
const unmatchTechnique = technique =>
  genericTechnique(technique, undealIntoNewStack, uncut, undealWithIncrement, BigInt)

const decToBin = number => {
  const remainders = []

  while (number) {
    remainders.push(number % 2n)
    number >>= 1n
  }

  return remainders
}

const extendedGcd = (a, b) => {
  if (a % b > 0) {
    let [v, d] = extendedGcd(b, a % b).slice(1)

    return [v, (d - a * v) / b, d]
  }

  return [0n, 1n, b]
}

const inv = (n, mod) => (mod + extendedGcd(n, mod)[0]) % mod

const pow = (b, exp, mod) => {
  let result = 1n
  let factor = b

  const binary = decToBin(exp)

  for (let i = 0; i < binary.length; i++) {
    if (binary[i]) {
      result = (result * factor) % mod
    }

    factor = factor ** 2n % mod
  }

  return result
}

const getCoefficients = input => {
  input.reverse()

  cardPosition = 0n
  input.forEach(unmatchTechnique)
  const b = cardPosition

  cardPosition = 1n
  input.forEach(unmatchTechnique)
  const a = (cardPosition - b + numCards) % numCards

  return [a, b]
}

let card = 2019
let numCards = 10007
let cardPosition = card

const main = async () => {
  const input = await getInput()

  input.forEach(matchTechnique)

  console.log(`Position of card ${card} (1): ${cardPosition}`)

  numCards = 119315717514047n
  const times = 101741582076661n

  const [a, b] = getCoefficients(input)
  const a_n = pow(a, times, numCards)

  cardPosition = 2020n
  card = (a_n * cardPosition + (a_n - 1n) * inv(a - 1n, numCards) * b) % numCards

  console.log(`Card at position ${cardPosition} (2): ${card}`)
}

main()
