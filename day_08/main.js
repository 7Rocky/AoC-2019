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

const countPixels = (pixel, layer) => {
  return layer.map(row => row.filter(p => p === pixel).length).reduce((t, n) => t + n)
}

const makeImage = (image, layers) => {
  const pointer = [0, 0]

  while (countPixels('#', image)) {
    const pixels = layers.map(layer => layer[pointer[1]][pointer[0]])
    image[pointer[1]][pointer[0]] = pixels.find(pixel => pixel !== 2)
    pointer[0]++

    if (pointer[0] === dimensions[0]) {
      pointer[0] = 0
      pointer[1]++

      if (pointer[1] === dimensions[1]) break
    }
  }
}

const decode = image => image.reduce((d, row) => `${d}\n${row.join('').replace(/0/g, ' ')}`, '\n')

const dimensions = [25, 6]

const main = async () => {
  const pixelStream = await getInput()

  const pixels = pixelStream.split('').map(Number)

  const layers = []

  const totalLayers = pixels.length / (dimensions[0] * dimensions[1])

  for (let k = 0; k < totalLayers; k++) {
    const layer = []

    for (let j = 0; j < dimensions[1]; j++) {
      const row = []

      for (let i = 0; i < dimensions[0]; i++) {
        row.push(pixels[(k * dimensions[1] + j) * dimensions[0] + i])
      }

      layer.push(row)
    }

    layers.push(layer)
  }

  let wantedLayer
  let minCount = dimensions[0] * dimensions[1]

  for (const layer of layers) {
    const count = countPixels(0, layer)

    if (minCount > count) {
      wantedLayer = layer
      minCount = count
    }
  }

  console.log(
    `Number of pixels 1 on the wanted layer (1): ${
      countPixels(1, wantedLayer) * countPixels(2, wantedLayer)
    }`
  )

  const image = []

  for (let j = 0; j < dimensions[1]; j++) {
    const row = []

    for (let i = 0; i < dimensions[0]; i++) {
      row.push('#')
    }

    image.push(row)
  }

  makeImage(image, layers)

  console.log(`Image decoded mesage (2): ${decode(image)}`)
}

main()
