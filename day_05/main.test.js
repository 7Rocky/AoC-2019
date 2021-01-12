const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 05', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('Output of Intcode (1): 7157989')
    expect(consoleSpy).toHaveBeenCalledWith('Output of Intcode (2): 7873292')
  })
})
