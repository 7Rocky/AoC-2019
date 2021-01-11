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

const gcd = (a, b) => {
  if (a % b > 0) return gcd(b, a % b)
  return b
}

const normalizeProportion = ([a, b]) => {
  let d = gcd(Math.abs(a), Math.abs(b))

  if (!a && !b) return [a, b]
  if (d) return [a / d, b / d]

  d = a ? Math.abs(a) : Math.abs(b)
  return [a / d, b / d]
}

const getProportion = (p, q, normalized = true) => {
  if (normalized) return normalizeProportion([p[0] - q[0], p[1] - q[1]])
  return [p[0] - q[0], p[1] - q[1]]
}

const existsProportion = (proportion, proportions) => {
  for (const p of proportions) {
    if (p[0] === proportion[0] && p[1] === proportion[1]) {
      return true
    }
  }

  return false
}

const setSights = asteroids => {
  asteroids.forEach(asteroid => {
    const proportions = []

    asteroids.forEach(a => {
      const proportion = getProportion(a.position, asteroid.position)

      if (!existsProportion(proportion, proportions)) {
        proportions.push(proportion)
      }
    })

    asteroid.sight = proportions.length - 1
  })
}

const vaporize = (asteroids, station, direction) => {
  const candidates = asteroids
    .filter(a => angle(getProportion(a.position, station.position)) === direction)
    .filter(a => !a.vaporized)

  if (candidates.length) {
    candidates.sort((p, q) => magnitude(q.position) - magnitude(p.position))
    candidates[0].vaporized = true

    return candidates[0].position
  }

  return false
}

const magnitude = ([a, b]) => Math.pow(a, 2) + Math.pow(b, 2)

const angle = ([a, b]) => Math.atan2(a, b)

const main = async () => {
  const space = await getInput()
  const asteroids = []

  for (let i = 0; i < space.length; i++) {
    for (let j = 0; j < space[i].length; j++) {
      if (space[i][j] === '#') {
        asteroids.push({ position: [j, i], sight: 0, vaporized: false })
      }
    }
  }

  setSights(asteroids)

  const maxSight = asteroids
    .map(asteroid => asteroid.sight)
    .sort()
    .pop()

  const station = asteroids.find(asteroid => asteroid.sight === maxSight)

  const angles = [
    ...new Set(
      asteroids
        .map(a => getProportion(a.position, station.position))
        .filter(p => p[0] !== 0 || p[1] !== 0)
        .map(angle)
        .sort((p, q) => q - p)
    )
  ]

  let lastVaporizedAsteroid = {}
  let k = 0
  let count = 0

  while (count < 200) {
    lastVaporizedAsteroid = vaporize(asteroids, station, angles[k])
    k = (k + 1) % angles.length

    if (lastVaporizedAsteroid) count++
  }

  const result = lastVaporizedAsteroid[0] * 100 + lastVaporizedAsteroid[1]

  console.log(`BOOST keycode (1): ${maxSight}`)
  console.log(`Coordinates of the distress signal (2): ${result}`)
}

main()
