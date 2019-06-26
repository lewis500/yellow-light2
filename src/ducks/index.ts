import React, { Dispatch } from "react";
import memoizeone from "memoize-one";
import { params, widths } from "src/constants";

export const initialState = {
  play: false,
  v0: params.v0,
  x0: 15,
  stopper: {
    x: widths.start,
    v: params.v0
  },
  mover: {
    x: widths.start,
    v: params.v0
  },
  time: 0,
  useState: 2,
  yellow: 2
};
type State = typeof initialState;
type CarType = { x: number; v: number };
type ActionTypes =
  | {
      type: "TICK";
      payload: { time: number; mover: CarType; stopper: CarType };
    }
  | {
      type: "SET_TIME";
      payload: number;
    }
  | { type: "SET_X0"; payload: number }
  | { type: "SET_V0"; payload: number }
  | { type: "SET_YELLOW"; payload: number }
  | { type: "RESTART" }
  | { type: "RESET" }
  | { type: "SET_PLAY"; payload: boolean };

export const reducer = (state: State, action: ActionTypes): State => {
  switch (action.type) {
    case "TICK":
      let { time, mover, stopper } = action.payload;
      return {
        ...state,
        time,
        mover,
        stopper
      };
    case "SET_TIME":
      return {
        ...state,
        time: action.payload
      };
    case "SET_X0":
      return {
        ...state,
        x0: action.payload
      };
    case "SET_PLAY":
      return {
        ...state,
        play: action.payload
      };
    case "SET_YELLOW":
      return {
        ...state,
        yellow: action.payload
      };
    case "SET_V0":
      return {
        ...state,
        v0: action.payload
      };
    case "RESTART":
      return {
        ...state,
        mover: {
          v: state.v0,
          x: widths.start
        },
        stopper: {
          v: state.v0,
          x: widths.start
        }
      };
    case "RESET":
      return {
        ...state,
        play: false,
        mover: {
          v: state.v0,
          x: widths.start
        },
        stopper: {
          v: state.v0,
          x: widths.start
        }
      };
    default:
      return state;
  }
};

export const AppContext = React.createContext<{
  state: State;
  dispatch?: Dispatch<ActionTypes>;
}>({ state: initialState, dispatch: null });

export const getxssd = memoizeone(
  (v0: number) => v0 * params.tp + (v0 * v0) / 2 / params.a
);
export const getxcl = memoizeone((v0: number, yellow: number) => v0 * yellow);