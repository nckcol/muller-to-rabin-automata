const superset = require('./superset');

test('superset of empty set is empty set', () => {
  expect(superset([])).toEqual([[]]);
});

test('superset of two elements', () => {
  expect(superset(['a', 'b'])).toEqual([[], ['a'], ['b'], ['a', 'b']]);
});

test('superset of three elements', () => {
  expect(superset(['a', 'b', 'c'])).toEqual(
    expect.arrayContaining([
      [],
      ['a'],
      ['b'],
      ['c'],
      ['a', 'b'],
      ['b', 'c'],
      ['a', 'c'],
      ['a', 'b', 'c']
    ])
  );
});
