const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 10', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('Maximum number of asteroids in sight (1): 288')
    expect(consoleSpy).toHaveBeenCalledWith('Position of 200th asteroid vaporized (2): 616')
  })
})
