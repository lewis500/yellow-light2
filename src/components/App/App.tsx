import React, { createElement as CE, FC, useEffect, useRef } from "react";
import useThunkReducer from "react-hook-thunk-reducer";
import style from "./styleApp.scss";
import root, { initialState, RootState, AC } from "src/ducks";
import get from "lodash/fp/get";
import { createSelector as CS } from "reselect";
import { scaleLinear } from "d3-scale";
import { timer, Timer } from "d3-timer";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/lab/Slider";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar, Typography as Text, Box } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
// Box
type N = number;
const w1 = 500,
  h1 = 300,
  margin = 25,
  WIDTH = w1 - 2 * margin,
  HEIGHT = h1 - 2 * margin,
  xScale = scaleLinear()
    .range([0, WIDTH])
    .domain([0, 4]),
  yScale = scaleLinear()
    .range([HEIGHT, 0])
    .domain([0, 5]),
  rScale = (v: number) =>
    (-Math.atan((((v * HEIGHT) / WIDTH) * 4) / 5) / Math.PI) * 180;

const getCarProps = CS<RootState, N, CarProps>(
  [get("car.s"), get("road.a"), get("road.b"), get("road.c")],
  (s, a, b, c) => {
    let x = xScale(s),
      y = yScale(s * s * a + s * b + c),
      r = rScale(2 * s * a + b);
    return { x, y, r };
  }
);

const getPath = (() => {
  const range: N[] = Array.apply({}, { length: 50 }).map(
    (_: {}, i: N) => (i / 50) * 4
  );
  return CS<RootState, N, string>(
    [get("road.a"), get("road.b"), get("road.c")],
    (a, b, c) =>
      "M" + range.map(d => [xScale(d), yScale(a * d * d + d * b + c)]).join("L")
  );
})();

type RoadProps = { path: string };
const Road: FC<RoadProps> = ({ path: d }) =>
  CE("path", { d, className: style.path });

type CarProps = { x: N; y: N; r: N };
const Car: FC<CarProps> = ({ x, y, r }) =>
  CE("rect", {
    transform: ` translate(${x} ${y}) rotate(${r} ) translate(-10,-8)`,
    width: 20,
    height: 8,
    className: style.car
  });

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.secondary.main,
    marginBottom: "15px"
  }
}))(Slider);

const App: FC = () => {
  const [state, dis] = useThunkReducer(root, initialState),
    ref = useRef<Timer | 0>(0);
  useEffect(() => {
    function stop() {
      if (ref.current) ref.current.stop();
      ref.current = null;
    }
    if (state.play) {
      let last = 0;
      ref.current = timer(t => {
        let dt = t - last;
        dis((dispatch, getState) => {
          last = t;
          dispatch(getState().car.s > 5 ? AC.Pause() : AC.Tick(dt / 100));
        });
      });
    } else stop();
    return stop;
  }, [state.play]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>hello</Toolbar>
      </AppBar>
      <div className={style.main}>
          <svg
            width={w1}
            height={h1}
            style={{ display: "inline-block" }}
          >
            <Road path={getPath(state)} />
            <Car {...getCarProps(state)} />
          </svg>
        <Paper className={style.paper}>
          <Text variant="body1">a</Text>
          <StyleSlider
            onChange={(e, v: number) => dis(AC.SetRoad("a", v))}
            value={state.road.a}
            max={0}
            min={-2}
            step={0.02}
          />
          <Text variant="body1">b</Text>
          <StyleSlider
            onChange={(e, v: number) => dis(AC.SetRoad("b", v))}
            value={state.road.b}
            min={0}
            step={0.1}
            max={4}
          />
          {/*
          <Text variant="body1">c</Text>
          <StyleSlider
            onChange={(e, v: N) => dis(AC.SetRoad("c", v))}
            value={state.road.c}
            min={0}
            step={0.1}
            max={4}
          /> */}
          <Text variant="body1">s</Text>
          <StyleSlider
            onChange={(e, v: N) => dis(AC.SetCar("s", v))}
            value={state.car.s}
            step={0.1}
            min={0}
            max={4}
          />
          <Button
            className={style.button}
            variant="contained"
            color="secondary"
            onClick={() => dis(AC.TogglePlay())}
          >
            Play
          </Button>
        </Paper>
      </div>
    </>
  );
};

export default App;

// import { transition } from "d3-transition";
// import { easeCubic, easeCubicInOut, easeBack } from "d3-ease";
// import {select} from 'd3-selection'
// useEffect(() => {
//   const t = transition()
//     .duration(600)
//     .ease(easeCubicInOut)
//     .tween("hello", () => {
//       console.log("starting");
//       // let i = easeBack;
//       return (t: number) => {
//         console.log(t);
//       };
//     });
//   // return () => {
//   //   t.cancel();
//   // };
// });
