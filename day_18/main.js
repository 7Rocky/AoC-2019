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

const findLinks = (maze, start) => {
  const links = {}
  const walk = { [start]: { steps: 0, doors: new Set() } }
  let next = [{ position: start, doors: new Set() }]

  for (let steps = 1; ; steps++) {
    if (!next.length) break

    const currrent = next
    next = []

    for (const { position, doors } of currrent) {
      for (const d of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1]
      ]) {
        const pos = position.split(', ').map(Number)
        const newPosition = `${pos[0] + d[0]}, ${pos[1] + d[1]}`

        const cell = maze[newPosition]

        if (cell === '#' || walk[newPosition]?.steps <= steps) continue

        if (cell.toLowerCase() === cell && !'.@'.includes(cell)) {
          links[cell] = { steps, doors }
        }

        const newDoors = new Set([...doors])

        if (cell.toUpperCase() === cell && !'.@'.includes(cell)) {
          newDoors.add(cell.toLowerCase())
        }

        walk[newPosition] = { steps, doors: newDoors }
        next.push({ position: newPosition, doors: newDoors })
      }
    }
  }

  return links
}

const findShortest = (maze, goals) => {
  const allKeys = new Set(Object.keys(goals).filter(g => g === g.toLowerCase() && g !== '@'))
  const links = { '@': findLinks(maze, goals['@']) }

  allKeys.forEach(k => (links[k] = findLinks(maze, goals[k])))

  const cache = {}

  const walk = (name, need_keys) => {
    if (need_keys.size === 0) return 0

    const key = name + [...need_keys].sort().join('')

    if (cache[key]) return cache[key]

    let shortest = Number.MAX_SAFE_INTEGER

    for (const nk of need_keys) {
      const { steps, doors } = links[name][nk]

      if (steps >= shortest || [...need_keys].some(k => doors.has(k))) continue

      const tail = walk(nk, new Set([...need_keys].filter(k => k !== nk)))

      if (shortest > steps + tail) shortest = steps + tail
    }

    cache[key] = shortest

    return shortest
  }

  return walk('@', allKeys)
}

const findShortest4 = (maze, goals) => {
  const s = goals['@'].split(', ').map(Number)

  maze[`${s[0]}, ${s[1]}`] = '#'
  maze[`${s[0] + 1}, ${s[1]}`] = '#'
  maze[`${s[0]}, ${s[1] + 1}`] = '#'
  maze[`${s[0] - 1}, ${s[1]}`] = '#'
  maze[`${s[0]}, ${s[1] - 1}`] = '#'
  maze[`${s[0] + 1}, ${s[1] + 1}`] = '1'
  maze[`${s[0] - 1}, ${s[1] + 1}`] = '2'
  maze[`${s[0] + 1}, ${s[1] - 1}`] = '3'
  maze[`${s[0] - 1}, ${s[1] - 1}`] = '4'

  goals['1'] = `${s[0] + 1}, ${s[1] + 1}`
  goals['2'] = `${s[0] - 1}, ${s[1] + 1}`
  goals['3'] = `${s[0] + 1}, ${s[1] - 1}`
  goals['4'] = `${s[0] - 1}, ${s[1] - 1}`

  const allKeys = new Set(
    Object.keys(goals).filter(g => g === g.toLowerCase() && !'@1234'.includes(g))
  )
  const links = {}

  Array('1', '2', '3', '4').forEach(n => (links[n] = findLinks(maze, goals[n])))
  allKeys.forEach(k => (links[k] = findLinks(maze, goals[k])))

  const cache = {}

  const walk = (names, need_keys) => {
    if (need_keys.size === 0) return 0

    const key = [...names].sort().join('') + [...need_keys].sort().join('')

    if (cache[key]) return cache[key]

    let shortest = Number.MAX_SAFE_INTEGER

    for (const nk of need_keys) {
      for (const name of names) {
        if (!links[name][nk]) continue

        const { steps, doors } = links[name][nk]

        if (steps >= shortest || [...need_keys].some(k => doors.has(k))) continue

        const tail = walk(
          [...[...names].filter(n => n !== name), nk],
          new Set([...need_keys].filter(k => k !== nk))
        )

        if (shortest > steps + tail) shortest = steps + tail
      }
    }

    cache[key] = shortest

    return shortest
  }

  return walk(['1', '2', '3', '4'], allKeys)
}

const main = async () => {
  const input = await getInput()

  const maze = {}
  const goals = {}

  input.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const cell = row.charAt(i)
      const position = `${i}, ${j}`
      maze[position] = cell

      if (!'#.'.includes(cell)) {
        goals[cell] = position
      }
    }
  })

  console.log(`Shortest path that collects all of the keys (1): ${findShortest(maze, goals)}`)
  console.log(`Fewest steps needed to collect all of the keys (2): ${findShortest4(maze, goals)}`)
}

main()
