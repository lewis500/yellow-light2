import { Dispatch, useRef, Reducer, useState } from "react";
import { Action, AnyAction } from "redux";

export interface Thunk<S, A extends Action> {
  (dispatch: Dispatch<A | Thunk<S, A>>, getState: () => S): void;
}

function useThunkReducer<S, A extends Action = AnyAction>(
  reducer: Reducer<S, A>,
  initialArg: S,
  init: (s: S) => S = a => a
): [S, Dispatch<A | Thunk<S, A>>] {
  const [hookState, setHookState] = useState(init(initialArg));

  // State management.
  const state = useRef(hookState);
  const getState = () => state.current;
  const setState = (newState: S) => {
    state.current = newState;
    setHookState(newState);
  };

  // Reducer and augmented dispatcher.
  const reduce = (action: A) => reducer(getState(), action);
  const dispatch: Dispatch<A | Thunk<S, A>> = (action: Thunk<S, A> | A) => {
    return typeof action === "function"
      ? action(dispatch, getState)
      : setState(reduce(action));
  };

  return [hookState, dispatch];
}

// declare function useThunkReducer<S, A>(reducer: Reducer<S, A>, initialArg: S, init?: (s: S) => S): [S, Dispatch<A | Thunk<S, A>>]

export default useThunkReducer;
