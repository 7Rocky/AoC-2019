const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 07', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('Highest signal sent to thrusters (1): 277328')
    expect(consoleSpy).toHaveBeenCalledWith('Highest signal sent to thrusters (2): 11304734')
  })
})
