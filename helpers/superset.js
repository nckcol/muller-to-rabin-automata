module.exports = function superset(set) {
  return set.reduce(
    (superset, item) => {
      return superset.concat(superset.map(set => set.concat(item)));
    },
    [[]]
  );
};
