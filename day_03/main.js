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

const getPathsPoints = path => {
  const pathPoints = [[0, 0]]

  const directions = path.split(',')

  for (let dir of directions) {
    const dirNumber = Number(dir.substring(1))

    for (let i = 1; i <= dirNumber; i++) {
      const lastPoint = pathPoints[pathPoints.length - 1]
      let newPoint = []

      switch (dir[0]) {
        case 'R':
          newPoint = [lastPoint[0] + 1, lastPoint[1]]
          break
        case 'L':
          newPoint = [lastPoint[0] - 1, lastPoint[1]]
          break
        case 'U':
          newPoint = [lastPoint[0], lastPoint[1] + 1]
          break
        case 'D':
          newPoint = [lastPoint[0], lastPoint[1] - 1]
          break
      }

      pathPoints.push(newPoint)
    }
  }

  return pathPoints
}

const findCrossingPoints = paths => {
  const crossingPoints = []

  for (const p of paths[0]) {
    for (const q of paths[1]) {
      if (p[0] === q[0] && p[1] === q[1]) {
        crossingPoints.push(p)
      }
    }
  }

  return crossingPoints
}

const getClosest = crossingPoints => {
  let minimumDistance = Number.MAX_SAFE_INTEGER

  for (const crossingPoint of crossingPoints) {
    const distance = crossingPoint[0] + crossingPoint[1]

    if (distance > 0 && distance < minimumDistance) {
      minimumDistance = distance
    }
  }

  return minimumDistance
}

const getSteps = (crossingPoints, path) => {
  const steps = [0]
  let step = 0
  const point = [0, 0]
  const directions = path.split(',')

  for (let dir of directions) {
    const dirNumber = Number(dir.substring(1))

    for (let i = 1; i <= dirNumber; i++) {
      switch (dir[0]) {
        case 'R':
          point[0]++
          break
        case 'L':
          point[0]--
          break
        case 'U':
          point[1]++
          break
        case 'D':
          point[1]--
          break
      }

      step++
      const index = indexOf(point, crossingPoints)

      if (index > 0) {
        steps[index - 1] = step
      }
    }
  }

  return steps
}

const indexOf = (point, points) => {
  for (let i = 0; i < points.length; i++) {
    if (points[i][0] === point[0] && points[i][1] === point[1]) {
      return i
    }
  }

  return -1
}

const main = async () => {
  const paths = await getInput()

  const pathsPoints = [getPathsPoints(paths[0]), getPathsPoints(paths[1])]
  const crossingPoints = findCrossingPoints(pathsPoints)
  const closestIntersection = getClosest(crossingPoints)

  console.log(`Manhattan distance to the closest intersection (1): ${closestIntersection}`)

  const steps = [getSteps(crossingPoints, paths[0]), getSteps(crossingPoints, paths[1])]

  let minimumSteps = Number.MAX_SAFE_INTEGER

  for (let i = 0; i < steps[0].length; i++) {
    if (steps[0][i] + steps[1][i] < minimumSteps) {
      minimumSteps = steps[0][i] + steps[1][i]
    }
  }

  console.log(`Minimum steps to reach an intersection (2): ${minimumSteps}`)
}

main()

module.exports = main
