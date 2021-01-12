const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 04', () => {
  it('should return correct results', () => {
    main()

    expect(consoleSpy).toHaveBeenCalledWith('Number of valid passwords (1): 475')
    expect(consoleSpy).toHaveBeenCalledWith('Number of valid passwords (2): 297')
  })
})
