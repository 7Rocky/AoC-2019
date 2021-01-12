const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 01', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('Sum of the fuel requirements (1): 3125750')
    expect(consoleSpy).toHaveBeenCalledWith('Sum of the total fuel requirements (2): 4685788')
  })
})
