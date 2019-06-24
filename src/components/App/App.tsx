import React, {
  createElement as CE,
  FC,
  useEffect,
  useRef,
  useReducer
} from "react";
import useThunkReducer from "react-hook-thunk-reducer";
import style from "./styleApp.scss";
import root, { initialState, RootState, AC } from "src/ducks";
import { scaleLinear } from "d3-scale";
import { timer, Timer } from "d3-timer";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/lab/Slider";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar, Typography as Text, Box, colors } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

type N = number;
const w1 = 500,
  h1 = 300,
  margin = 25,
  WIDTH = w1 - 2 * margin,
  HEIGHT = h1 - 2 * margin,
  xScale = scaleLinear()
    .range([0, WIDTH])
    .domain([0, 4]);

// type RoadProps = { path: string };
// const Road: FC<RoadProps> = ({ path: d }) =>
//   CE("path", { d, className: style.path });

const Road = CE("path", {
  d: `M0,${HEIGHT / 2}L${WIDTH}${HEIGHT / 2}M${WIDTH / 2},0L${WIDTH /
    2}${HEIGHT}`,
  strokeWidth: "50px",
  stroke: colors.grey["100"]
});

type CarProps = { x: N};
const Car: FC<CarProps> = ({ x }) =>
  CE("rect", {
    transform: `translate(${x} ${HEIGHT / 2})`,
    width: 20,
    height: 8,
    x: -4,
    y: -10,
    fill: colors.green.A400
  });

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.secondary.main,
    marginBottom: "15px"
  }
}))(Slider);

const App: FC = () => {
  const [state, dis] = useReducer(root, initialState),
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
        AC.Tick(dt / 1e3);
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
        <svg width={w1} height={h1} style={{ display: "inline-block" }}>
          {Road}
          <Car x={xScale(state.s)} />
        </svg>
        <Paper className={style.paper}>
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
