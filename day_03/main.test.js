const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 03', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith(
      'Manhattan distance to the closest intersection (1): 258'
    )
    expect(consoleSpy).toHaveBeenCalledWith('Minimum steps to reach an intersection (2): 12304')
  })
})
