module.exports = function union(A, B) {
  const C = [...A];

  for (b of B) {
    if (C.includes(b)) continue;
    C.push(b);
  }

  if (!C.length) {
    return [];
  }

  return C;
};
