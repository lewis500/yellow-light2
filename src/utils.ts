// export const binder = moize((fn, ...args1) => (...args2) =>
//   fn(...args1, ...args2)
// );
// create-reducer.ts
import { Action } from "redux";
// type Action<T extends string> = {type: T}
// type Actionextends string> = {type: T}
type Handlers<State, Types extends string, Actions extends Action<Types>> = {
  readonly [T in Types]: (state: State, action: Actions) => State
};
export const createReducer = <
  State,
  Types extends string,
  Actions extends Action<Types>
>(
  initialState: State,
  handlers: Handlers<State, Types, Actions>
) => (state = initialState, action: Actions) =>
  handlers.hasOwnProperty(action.type)
    ? handlers[action.type as Types](state, action)
    : state;

export const makeActionCreator = (type:string, ...argNames:string[]) => {
  return function(...args:any[]) {
    const action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
}
// import { Reducer } from "src/types/Reducer";

// export function createReducer<S, A>(
//   initialState: S,
//   handlers: { [key: string]: Reducer<S, A> }
// ): Reducer<S, A> {
//   return function reducer(state: S = initialState, action: A): S {
//     return handlers.hasOwnProperty(action.type)
//       ? handlers[action.type](state, action)
//       : state;
//   };
// }
