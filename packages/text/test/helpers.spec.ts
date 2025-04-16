import { arrayify } from 'eslint-plugin-text'

describe('arrayify', () => {
  it('should return an array', () => {
    expect(arrayify('test')).toEqual(['test'])
    expect(arrayify(['test'])).toEqual(['test'])
    expect(arrayify(['test', null])).toEqual(['test'])
    // eslint-disable-next-line no-sparse-arrays
    expect(arrayify(['test', null], null, ['hello', , 'world'])).toEqual([
      'test',
      'hello',
      'world',
    ])
  })
})
