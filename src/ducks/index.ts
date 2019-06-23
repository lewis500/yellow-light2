import {
  createReducer as CR,
  ActionType,
  createStandardAction as CSA,
  Reducer
} from "typesafe-actions";

export const AC = {
  SetCar: CSA("SET_CAR").map((key: string, val: number) => ({
    payload: { key, val }
  })),
  SetRoad: CSA("SET_ROAD").map((key: string, val: number) => ({
    payload: { key, val }
  })),
  IncrementS: CSA("INCREMENT_S")(),
  Tick: CSA("TICK")<number>(),
  TogglePlay: CSA("TOGGLE_PLAY")(),
  Pause: CSA("PAUSE")()
};

export type RA = ActionType<typeof AC> | { type: "blank" };

const initialRoadState = {
  a: -0.5,
  b: 1.6,
  c: 0
};

const InitialCarState = {
  s: .2,
  v: .15
};

const road = CR<RoadState, RA>(initialRoadState).handleAction(
  AC.SetRoad,
  (state, { payload: { key, val } }) => ({ ...state, [key]: val })
);

const car = (car: CarState = InitialCarState, action: RA, road: RoadState) => {
  switch (action.type) {
    case "SET_CAR":
      return {
        ...car,
        [action.payload.key]: action.payload.val
      };
    case "TICK":
      let { s, v } = car;
      let { a, b } = road;
      let theta = Math.atan(2 * a * s + b);
      s = s + Math.cos(theta) * v * action.payload;
      return {
        ...car,
        s
      };
    default:
      return car;
  }
};

const play = CR<boolean, RA>(false)
  .handleAction(AC.TogglePlay, state => !state)
  .handleAction(AC.Pause, () => false);

type CarState = {
  s: number;
  v: number;
};

type RoadState = {
  a: number;
  b: number;
  c: number;
};

export type RootState = {
  car: CarState;
  road: RoadState;
  play: boolean;
};

export const initialState = {
  play: false,
  car: InitialCarState,
  road: initialRoadState
};

const root: Reducer<RootState, RA> = (state = initialState, action) => ({
  play: play(state.play, action),
  car: car(state.car, action, state.road),
  road: road(state.road, action)
});

// export const initialState = root(undefined, { type: "blank" });

// const root2 =
// const root2: Reducer<RootState, RA> = (state, action) => {
//   state = root(state, action);
//   if(action.type === "TICK"){
//     let {a,b,c} = state.road;
//     let {s} = state.car;
//     return {
//       ...state,
//       car:{
//         v: car.v,
//         s:
//       }
//     }

//   }
//   return state;
// };

export default root;
