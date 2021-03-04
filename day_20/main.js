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

const getSurrounding = ([x, y]) => [
  `${x},${y - 1}`,
  `${x - 1},${y}`,
  `${x},${y + 1}`,
  `${x + 1},${y}`
]

const nextPositions = (point, level) => {
  const possiblePositions = []
  const positions = getSurrounding(point.position.split(',').map(Number))

  for (let d = 0; d < positions.length; d++) {
    if (map[positions[d]] === '.') {
      possiblePositions.push({ position: positions[d], level: point.level })
    } else if (!'# '.includes(map[positions[d]])) {
      const position = findPortal(positions[d], map[positions[d]])

      if (position) {
        const [px, py] = positions[d].split(',').map(Number)
        let nextLevel = point.level

        if (px <= 1 || py <= 1 || px >= input[0].length - 2 || py >= input.length - 2) {
          nextLevel--
        } else {
          nextLevel++
        }

        if (level !== 2 || nextLevel >= 0) {
          possiblePositions.push({ position, level: nextLevel })
        }
      }
    }
  }

  return possiblePositions
}

const findBond = position => {
  const positions = getSurrounding(position.split(',').map(Number))

  for (let d = 0; d < positions.length; d++) {
    if (map[positions[d]] && !'#. '.includes(map[positions[d]])) {
      return { bond: map[positions[d]], upOrLeft: d < 2 }
    }
  }
}

const findPoint = position => {
  const positions = getSurrounding(position.split(',').map(Number))

  for (let d = 0; d < positions.length; d++) {
    if (map[positions[d]] && map[positions[d]] === '.') {
      return positions[d]
    }
  }

  for (let d = 0; d < positions.length; d++) {
    if (map[positions[d]] && !'#. '.includes(map[positions[d]])) {
      return positions[d]
    }
  }
}

const findPortal = (position, portal) => {
  const { bond, upOrLeft } = findBond(position)
  const possibleMatches = portals[bond]

  for (const match of possibleMatches) {
    const { bond: newBond, upOrLeft: newUpOrLeft } = findBond(match)

    if (newBond === portal && newUpOrLeft !== upOrLeft) {
      let point = findPoint(match)
      if (map[point] === '.') return point

      if (point !== position) {
        point = findPoint(point)
        if (map[point] === '.') return point
      }
    }
  }
}

const breadthFirstSearch = (root, target, level) => {
  const queue = [root]
  const visited = new Set(level === 2 ? [root.level + ' - ' + root.position] : [root.position])

  while (queue.length) {
    const node = queue.shift()

    if (level === 2) {
      if (node.position === target && node.level === 0) {
        return node.steps
      }
    } else if (node.position === target) {
      return node.steps
    }

    for (const next of nextPositions(node, level)) {
      if (level === 2) {
        if (!visited.has(next.level + ' - ' + next.position)) {
          next.steps = node.steps + 1
          queue.push(next)
          visited.add(next.level + ' - ' + next.position)
        }
      } else if (!visited.has(next.position)) {
        next.steps = node.steps + 1
        queue.push(next)
        visited.add(next.position)
      }
    }
  }
}

const getPosition = portal => {
  let position
  const possible = portals[portal]

  for (const pos of possible) {
    if (findBond(pos).bond === portal) {
      const point = findPoint(pos)
      if (map[point] === '.') position = point
    }
  }

  return position
}

const map = {}
const portals = {}
let input

const main = async () => {
  input = await getInput()

  input.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      map[`${i},${j}`] = row[i]
    }
  })

  for (const pos in map) {
    if (!'.# '.includes(map[pos])) {
      if (!portals[map[pos]]) {
        portals[map[pos]] = []
      }

      portals[map[pos]].push(pos)
    }
  }

  const startingPosition = getPosition('A')
  const endingPosition = getPosition('Z')

  let steps = breadthFirstSearch({ position: startingPosition, steps: 0 }, endingPosition)
  console.log(`Minimum number of steps (1): ${steps}`)

  steps = breadthFirstSearch({ position: startingPosition, steps: 0, level: 0 }, endingPosition, 2)
  console.log(`Minimum number of steps (2): ${steps}`)
}

main()
