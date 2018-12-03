function TransitionRelation(state, inputSymbol, nextState) {
  return {
    state,
    inputSymbol,
    nextState,

    match(state, inputSymbol) {
      return state === this.state && inputSymbol === this.inputSymbol;
    },

    toString() {
      const left = `${this.state}, ${this.inputSymbol}`;
      const right = `${this.nextState}`;
      return `(${left}) -> (${right})`;
    }
  };
}

function RabinAutomata(
  states, // A
  inputAlphabet, // X
  transitionRelation, // f
  startState, // a0
  statePairList // R
) {
  return {
    states,
    inputAlphabet,
    transitionRelation,
    startState,
    statePairList,

    state: startState,
    next(inputSymbol) {
      if (!this.inputAlphabet.includes(inputSymbol)) {
        throw new Error("Input symbol is not exist in input alphabet");
      }
    },
    toString() {
      const statesString = `{ ${this.states.join(", ")} }`;
      const inputAlphabetString = `{ ${this.inputAlphabet.join(", ")} }`;

      const relationString = this.transitionRelation.join("\n");

      const startStateString = startState.toString();
      const statePairListString = `{ ${statePairListString.join(", ")} }`;

      return `
A = ${statesString}
X = ${inputAlphabetString}

f:
${relationString}

start: ${startStateString}
        `;
    }
  };
}

function getSuperset(set) {
  const superset = [[null]];
  const len = set.length + 1;
  for (let size = 1; size < len; size++) {
    for (let i = 0; i < len - size; i++) {
      superset.push(set.slice(i, i + size));
    }
  }
  return superset;
}

const composition = (a, b) => {
  const composition = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      composition.push(a[i].concat([b[j]]));
    }
  }
  return composition;
};

function getRabinState(table, states) {
  return table
    .map(getSuperset)
    .concat([states.map(a => [a])])
    .reduce(composition, [[]]);
}

function e(a) {
  if (a === null) {
    return "e";
  }

  return a;
}

function equal(A, B) {
  if (A.length !== B.length) {
    return false;
  }

  for (let i = 0; i < A.length; i++) {
    if (!B.includes(A[i])) {
      return false;
    }
  }

  return true;
}

function union(A, B) {
  const C = [...A];

  for (b of B) {
    if (C.includes(b)) continue;
    C.push(b);
  }

  if (!C.length) {
    return [null];
  }

  return C.filter(item => item !== null);
}

function intersection(A, B) {
  const C = [];

  for (a of A) {
    if (!B.includes(a)) continue;
    C.push(a);
  }

  if (!C.length) {
    return [null];
  }

  return C.filter(item => item !== null);
}

function solveRelation(relation, state, input) {
  for (item of relation) {
    if (item.match(state, input)) return item.nextState;
  }
}

function findStateIndex(states, state) {
  for (let i = 0; i < states.length; i++) {
    let equal = true;
    for (let j = 0; j < states[i].length; j++) {
      if (states[i][j][0] !== state[j][0]) {
        equal = false;
        break;
      }
    }
    if (equal) {
      return i;
    }
  }
  return -1;
}

function MullerAutomata(
  states, // A
  inputAlphabet, // X
  transitionRelation, // f
  startState, // a0
  table // F
) {
  return {
    states,
    inputAlphabet,
    transitionRelation,
    startState,
    table,
    toRabinAutomata() {
      const states = [];
      const transitions = [];

      //   const R = [];

      const A = getRabinState(this.table, this.states);

      const startState = Array.from({ length: table.length })
        .fill([null])
        .concat([[this.startState]]);

      const startStateIndex = findStateIndex(A, startState);

      A.forEach((state, num) => {
        const a = state[state.length - 1][0];
        const UU = state.slice(0, state.length - 1);

        console.log(num, state);
        states.push(num);

        for (x of this.inputAlphabet) {
          const a_ = solveRelation(this.transitionRelation, a, x);

          const UU_ = UU.map((U, index) => {
            const F = table[index];
            if (equal(U, F)) {
              return [null];
            }
            return intersection(F, union(U, [a_]));
          });

          const newState = UU_.concat([[a_]]);

          const newStateIndex = findStateIndex(A, newState);

          transitions.push(TransitionRelation(num, x, newStateIndex));
        }
      });

      console.log("start:", startStateIndex);

      console.log(transitions.join("\n"));

      const statePairList = [];

      return RabinAutomaton(
        states,
        this.inputAlphabet,
        transitions,
        startStateIndex,
        statePairList
      );
    }
  };
}

function main() {
  const s1 = "s1";
  const s2 = "s2";
  const states = [s1, s2];

  const [a, b] = ["a", "b"];

  const alphabet = [a, b];

  const table1 = [[s1], [s1, s2]]; // infinitely many 'a'
  const table2 = [[s2]]; // finitely many 'a'

  const transitions = [
    TransitionRelation(s1, a, s1),
    TransitionRelation(s1, b, s2),
    TransitionRelation(s2, a, s1),
    TransitionRelation(s2, b, s2)
  ];

  const MA = MullerAutomata(states, alphabet, transitions, s1, table2);

  const RA = MA.toRabinAutomata();
}

main();

// const s1 = "s1";
// const s2 = "s2";
// const states = [s1, s2];
// // const states = [s1];
// const table1 = [[s1], [s1, s2]]; // infinitely many 'a'
// // const table1 = [[s1]];
// console.log("\n");
// console.log(getRabinState(table1, states));
