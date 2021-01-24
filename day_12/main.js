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

const sum = (t, n) => t + n

class Moon {
  #position
  #velocity = [0, 0, 0]

  constructor(position) {
    this.setPosition(position)
  }

  applyGravity(moon) {
    const moonPosition = moon.getPosition()

    for (const d of [0, 1, 2]) {
      if (this.#position[d] < moonPosition[d]) this.#velocity[d]++
      if (this.#position[d] > moonPosition[d]) this.#velocity[d]--
    }
  }

  applyVelocity() {
    for (const d of [0, 1, 2]) {
      this.#position[d] += this.#velocity[d]
    }
  }

  calculateTotalEnergy() {
    return this.#calculateKineticEnergy() * this.#calculatePotentialEnergy()
  }

  #calculateKineticEnergy() {
    return this.#velocity.map(Math.abs).reduce(sum)
  }

  #calculatePotentialEnergy() {
    return this.#position.map(Math.abs).reduce(sum)
  }

  toString(d) {
    return this.#position[d] + '.' + this.#velocity[d]
  }

  getPosition() {
    return this.#position
  }

  setPosition(position) {
    this.#position = position
  }
}

const gcd = (a, b) => {
  if (a % b > 0) return gcd(b, a % b)
  return b
}

const lcm = (a, b) => {
  return (a * b) / gcd(a, b)
}

const main = async () => {
  const positions = await getInput()
  const moons = positions.map(
    position =>
      new Moon(
        position
          .match(/<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/)
          .slice(1, 4)
          .map(Number)
      )
  )

  const previousStates = [new Set(), new Set(), new Set()]
  const cycles = [0, 0, 0]

  let steps = 0

  while (cycles.some(c => c === 0)) {
    for (let i = 0; i < moons.length; i++) {
      for (let j = 0; j < moons.length; j++) {
        if (i !== j) {
          moons[i].applyGravity(moons[j])
        }
      }
    }

    moons.forEach(m => m.applyVelocity())

    const states = [0, 1, 2].map(d => moons.map(m => m.toString(d)).join('|'))

    for (const d of [0, 1, 2]) {
      if (cycles[d] === 0 && previousStates[d].has(states[d])) {
        cycles[d] = steps
      } else {
        previousStates[d].add(states[d])
      }
    }

    steps++

    if (steps === 1000) {
      const totalEnergy = moons.map(m => m.calculateTotalEnergy()).reduce(sum)
      console.log(`Total energy of the system (1): ${totalEnergy}`)
    }
  }

  console.log(`Time to repeat a previous state (2): ${lcm(lcm(cycles[0], cycles[1]), cycles[2])}`)
}

main()
