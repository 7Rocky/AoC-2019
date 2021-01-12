const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 02', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('First position of Intcode (1): 6087827')
    expect(consoleSpy).toHaveBeenCalledWith('100 * noun + verb (2): 5379')
  })
})
