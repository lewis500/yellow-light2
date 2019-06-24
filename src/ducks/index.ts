import {
  createReducer as CR,
  ActionType,
  createStandardAction as CSA,
  Reducer
} from "typesafe-actions";
import { combineReducers } from "redux";
import { number } from "prop-types";

export const WIDTH = 500;
export const HEIGHT = 300;

export const AC = {
  SetV: CSA("SET_V")<number>(),
  SetS: CSA("SET_S")<number>(),
  SetA: CSA("SET_A")<number>(),
  Tick: CSA("TICK")<number>(),
  TogglePlay: CSA("TOGGLE_PLAY")(),
  Pause: CSA("PAUSE")()
};

export type RA = ActionType<typeof AC> | { type: "blank" };

const play = CR<boolean, RA>(false)
  .handleAction(AC.TogglePlay, state => !state)
  .handleAction(AC.Pause, () => false);

const v = (state: number, action: RA, a: number) => {
  switch (action.type) {
    case "TICK":
      return state + action.payload * a;
    case "SET_V":
      return action.payload;
  }
};

const s = (state: number, action: RA, v: number, a: number) => {
  switch (action.type) {
    case "TICK":
      let dt = action.payload;
      return state + dt * (v - 0.5 * a * dt);
    case "SET_S":
      return action.payload;
    default:
      return state;
  }
};

const a = CR<number, RA>(0.1).handleAction(
  AC.SetA,
  (_, { payload }) => payload
);

// const s = CR<number, RA>(0)
//   .handleAction(AC.TogglePlay, state => !state)
//   .handleAction(AC.Pause, () => false);

export type RootState = {
  s: number;
  v: number;
  a: number;
  play: boolean;
};

export const initialState = {
  play: false,
  s: 0,
  v: 1,
  a: 0.1
};

const root: Reducer<RootState, RA> = (state = initialState, action) => ({
  play: play(state.play, action),
  v: v(state.v, action, state.a),
  s: s(state.s, action, state.v, state.a),
  a: a(state.a, action)
});

export default root;
