const main = require('./main')

const consoleSpy = jest.spyOn(console, 'log')

describe('AoC 2019 Problem 06', () => {
  it('should return correct results', async () => {
    await main()

    expect(consoleSpy).toHaveBeenCalledWith('Sum of direct and indirect orbits (1): 204521')
    expect(consoleSpy).toHaveBeenCalledWith('Orbit transfers between YOU and SAN (2): 307')
  })
})
