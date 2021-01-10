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

const main = async () => {
  const input = await getInput()

  const planetNames = input.map(orbit => orbit.substring(orbit.indexOf(')') + 1))

  planetNames.push('COM')

  const planets = {}

  planetNames.forEach(p => {
    planets[p] = {}
    planetNames.forEach(q => (planets[p][q] = p === q ? 0 : -1))
  })

  input.forEach(orbit => {
    const p = orbit.substring(0, orbit.indexOf(')'))
    const q = orbit.substring(orbit.indexOf(')') + 1)

    planets[q][p] = 1
  })

  for (let i = 0; i < 2; i++) {
    // Re-iterate to get the complete Dijkstra "matrix"
    planetNames.forEach(p =>
      planetNames.forEach(q => {
        if (planets[p][q] > 0) {
          planetNames
            .filter(r => planets[q][r] > 0)
            .forEach(r => {
              planets[p][r] = planets[p][q] + planets[q][r]
            })
        }
      })
    )
  }

  let direct = 0
  let indirect = 0

  planetNames.forEach(p =>
    planetNames.forEach(q => {
      if (planets[p][q] === 1) direct++
      if (planets[p][q] > 1) indirect++
    })
  )

  console.log(`Sum of direct and indirect orbits (1): ${direct + indirect}`)

  let commonPlanet = 'COM'
  let distances = [planets['YOU'][commonPlanet], planets['SAN'][commonPlanet]]

  for (const p of planetNames) {
    if (planets['YOU'][p] > 0 && planets['SAN'][p] > 0) {
      if (distances[0] > planets['YOU'][p] && distances[1] > planets['SAN'][p]) {
        distances = [planets['YOU'][p], planets['SAN'][p]]
      }
    }
  }

  console.log(`Orbit transfers between YOU and SAN (2): ${distances[0] + distances[1] - 2}`)
}

main()
