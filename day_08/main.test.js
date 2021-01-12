const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 08', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('Number of pixels 1 on the wanted layer (1): 828')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Image decoded mesage (2): \n\n1111 1    111    11 1111 \n   1 1    1  1    1 1    \n  1  1    111     1 111  \n 1   1    1  1    1 1    \n1    1    1  1 1  1 1    \n1111 1111 111   11  1    '
    )
  })
})
