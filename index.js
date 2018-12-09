const superset = require('./helpers/superset');
const intersection = require('./helpers/intersection');
const union = require('./helpers/union');

function Set(array) {
  let elements = array;
  return {
    toString() {}
  };
}

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
        throw new Error('Input symbol is not exist in input alphabet');
      }
    },
    toString() {
      const statesString = `{ ${this.states.join(', ')} }`;
      const inputAlphabetString = `{ ${this.inputAlphabet.join(', ')} }`;

      const relationString = this.transitionRelation.join('\n');

      const startStateString = startState.toString();
      const statePairListString = `{ ${statePairListString.join(', ')} }`;

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
    .map(superset)
    .concat([states.map(a => [a])])
    .reduce(composition, [[]]);
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

function solveRelation(relation, state, input) {
  for (let item of relation) {
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
      console.log('========== Rabin Automata ===========');
      const states = [];
      const transitions = [];

      //   const R = [];

      const A = getRabinState(this.table, this.states);

      console.log('\n');
      console.log(A);
      console.log('\n');

      const startState = Array.from({ length: table.length })
        .fill([])
        .concat([[this.startState]]);

      console.log(startState);

      const startStateIndex = findStateIndex(A, startState);

      A.forEach((state, num) => {
        const a = state[state.length - 1][0];
        const UU = state.slice(0, state.length - 1);

        console.log(num, state);
        states.push(num);

        for (let x of this.inputAlphabet) {
          let a_ = solveRelation(this.transitionRelation, a, x);

          if (!a_) {
            a_ = a;
          }

          const UU_ = UU.map((U, index) => {
            const F = table[index];
            console.log(F);
            if (equal(U, F)) {
              console.log('empty');
              return [];
            }

            console.log('not empty');
            return intersection(F, union(U, [a_]));
          });

          const newState = UU_.concat([[a_]]);
          console.log(a, a_, state, newState);

          const newStateIndex = findStateIndex(A, newState);

          transitions.push(TransitionRelation(num, x, newStateIndex));
        }
      });

      console.log('start:', startStateIndex);

      console.log('f:');
      console.log(transitions.join('\n'));

      const statePairList = table.map((Fi, index) => {
        // console.log(Fi);
        const S = A.filter(
          state =>
            // console.log(state[state.length - 1][0]) ||
            !Fi.includes(state[state.length - 1][0])
        ).map(ns => findStateIndex(A, ns));
        const R = A.filter(state =>
          // console.log(state[index]) ||
          equal(state[index], Fi)
        ).map(ns => findStateIndex(A, ns));
        return [S, R];
      });

      console.log('Pairs: ');
      statePairList.forEach(([S, R], index) => {
        console.log(`S${index}: `, S, `R${index}: `, R);
      });

      return RabinAutomata(
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
  const s0 = 's0';
  const s1 = 's1';
  const s2 = 's2';
  const states = [s1, s2];

  const [a, b] = ['a', 'b'];

  const alphabet = [a, b];

  const table1 = [[s1], [s1, s2]]; // infinitely many 'a'
  const table2 = [[s2]]; // finitely many 'a'

  const transitions = [
    TransitionRelation(s1, a, s1),
    TransitionRelation(s1, b, s2),
    TransitionRelation(s2, a, s1),
    TransitionRelation(s2, b, s2)
  ];

  // const transitions = [
  //   TransitionRelation(s0, a, s1),
  //   TransitionRelation(s0, b, s2),
  //   TransitionRelation(s1, a, s1),
  //   TransitionRelation(s1, b, s0),
  //   TransitionRelation(s2, a, s1)
  // ];

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
