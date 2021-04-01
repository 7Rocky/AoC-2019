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

const sum = (t, n) => t + n

const countAdjacent = (state, j, i) => {
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ]
    .map(([m, n]) => {
      if (!state[j + m]) return 0
      return Number(state[j + m][i + n] === '#')
    })
    .reduce(sum)
}

const update = oldState => {
  const newState = []

  for (let j = 0; j < oldState.length; j++) {
    const newRow = []

    for (let i = 0; i < oldState[j].length; i++) {
      const rowCount = countAdjacent(oldState, j, i)

      if (oldState[j][i] === '#' && rowCount === 1) {
        newRow.push('#')
      } else if (oldState[j][i] === '.' && (rowCount === 1 || rowCount === 2)) {
        newRow.push('#')
      } else {
        newRow.push('.')
      }
    }

    newState.push(newRow)
  }

  return newState
}

const count = list => list.filter(t => t === '#').length

const updateLevel = (oldState, innerState, outerState) => {
  const newState = []

  if (innerState == undefined) innerState = createInnerState()
  if (outerState == undefined) outerState = createInnerState()

  const counts = [Array(5), Array(5), Array(5), Array(5), Array(5)]

  counts[0][0] = count([outerState[1][2], oldState[0][1], oldState[1][0], outerState[2][1]])
  counts[0][1] = count([outerState[1][2], oldState[0][2], oldState[1][1], oldState[0][0]])
  counts[0][2] = count([outerState[1][2], oldState[0][3], oldState[1][2], oldState[0][1]])
  counts[0][3] = count([outerState[1][2], oldState[0][4], oldState[1][3], oldState[0][2]])
  counts[0][4] = count([outerState[1][2], outerState[2][3], oldState[1][4], oldState[0][3]])

  counts[1][0] = count([oldState[0][0], oldState[1][1], oldState[2][0], outerState[2][1]])
  counts[1][1] = count([oldState[0][1], oldState[1][2], oldState[2][1], oldState[1][0]])
  counts[1][2] = count([
    oldState[0][2],
    oldState[1][3],
    innerState[0][4],
    innerState[0][3],
    innerState[0][2],
    innerState[0][1],
    innerState[0][0],
    oldState[1][1]
  ])
  counts[1][3] = count([oldState[0][3], oldState[1][4], oldState[2][3], oldState[1][2]])
  counts[1][4] = count([oldState[0][4], outerState[2][3], oldState[2][4], oldState[1][3]])

  counts[2][0] = count([oldState[1][0], oldState[2][1], oldState[3][0], outerState[2][1]])
  counts[2][1] = count([
    oldState[1][1],
    innerState[0][0],
    innerState[1][0],
    innerState[2][0],
    innerState[3][0],
    innerState[4][0],
    oldState[3][1],
    oldState[2][0]
  ])
  counts[2][3] = count([
    oldState[1][3],
    oldState[2][4],
    oldState[3][3],
    innerState[4][4],
    innerState[3][4],
    innerState[2][4],
    innerState[1][4],
    innerState[0][4]
  ])
  counts[2][4] = count([oldState[1][4], outerState[2][3], oldState[3][4], oldState[2][3]])

  counts[3][0] = count([oldState[2][0], oldState[3][1], oldState[4][0], outerState[2][1]])
  counts[3][1] = count([oldState[2][1], oldState[3][2], oldState[4][1], oldState[3][0]])
  counts[3][2] = count([
    innerState[4][0],
    innerState[4][1],
    innerState[4][2],
    innerState[4][3],
    innerState[4][4],
    oldState[3][3],
    oldState[4][2],
    oldState[3][1]
  ])
  counts[3][3] = count([oldState[2][3], oldState[3][4], oldState[4][3], oldState[3][2]])
  counts[3][4] = count([oldState[2][4], outerState[2][3], oldState[4][4], oldState[3][3]])

  counts[4][0] = count([oldState[3][0], oldState[4][1], outerState[3][2], outerState[2][1]])
  counts[4][1] = count([oldState[3][1], oldState[4][2], outerState[3][2], oldState[4][0]])
  counts[4][2] = count([oldState[3][2], oldState[4][3], outerState[3][2], oldState[4][1]])
  counts[4][3] = count([oldState[3][3], oldState[4][4], outerState[3][2], oldState[4][2]])
  counts[4][4] = count([oldState[3][4], outerState[2][3], outerState[3][2], oldState[4][3]])

  for (let j = 0; j < counts.length; j++) {
    const newRow = []

    for (let i = 0; i < counts[j].length; i++) {
      if (i === 2 && j === 2) {
        newRow.push('?')
      } else if (oldState[j][i] === '#' && counts[j][i] === 1) {
        newRow.push('#')
      } else if (oldState[j][i] === '.' && (counts[j][i] === 1 || counts[j][i] === 2)) {
        newRow.push('#')
      } else {
        newRow.push('.')
      }
    }

    newState.push(newRow)
  }

  return newState
}

const updateLevels = levels => {
  const newLevels = new Map()

  for (const level of levels.keys()) {
    newLevels.set(
      level,
      updateLevel(
        levels.get(level),
        levels.get(level - 1) ?? createInnerState(),
        levels.get(level + 1) ?? createInnerState()
      )
    )
  }

  return newLevels
}

const stateToString = state => state.map(row => row.join('')).join('')

const biodiversity = string => {
  return string
    .split('')
    .map((t, i) => (t === '#' ? 2 ** i : 0))
    .reduce(sum)
}

const countBugs = levels => {
  let number = 0

  for (const level of levels.keys()) {
    number += levels
      .get(level)
      .map(row => count(row))
      .reduce(sum)
  }

  return number
}

const createInnerState = () => [
  '.....'.split(''),
  '.....'.split(''),
  '..?..'.split(''),
  '.....'.split(''),
  '.....'.split('')
]

const main = async () => {
  const input = await getInput()

  let state = input.map(row => row.split(''))
  let string = stateToString(state)

  const states = new Set()
  states.add(string)

  for (let i = 0; ; i++) {
    state = update(state)
    string = stateToString(state)

    if (states.has(string)) break

    states.add(string)
  }

  console.log(`Biodiversity (1): ${biodiversity(string)}`)

  const minutes = 200

  state = input.map(row => row.split(''))
  state[2][2] = '?'

  let levels = new Map()
  levels.set(0, state)

  for (let i = 1; i <= minutes; i++) {
    levels.set(i, createInnerState())
    levels.set(-i, createInnerState())
  }

  for (let i = 0; i < minutes; i++) {
    levels = updateLevels(levels)
  }

  console.log(`Number of bugs after ${minutes} minutes (2): ${countBugs(levels)}`)
}

main()
