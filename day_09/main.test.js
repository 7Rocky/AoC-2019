const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 09', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('BOOST keycode (1): 3335138414')
    expect(consoleSpy).toHaveBeenCalledWith('Coordinates of the distress signal (2): 49122')
  })
})
