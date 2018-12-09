module.exports = function intersection(A, B) {
  const C = [];

  for (let a of A) {
    if (!B.includes(a)) continue;
    C.push(a);
  }

  if (!C.length) {
    return [];
  }

  return C;
};
