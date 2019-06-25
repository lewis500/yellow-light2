import React, {
  createElement as CE,
  FunctionComponent,
  useEffect,
  useRef,
  useLayoutEffect,
  Dispatch,
  SetStateAction,
  useState
} from "react";
import style from "./styleApp.scss";
import { scaleLinear } from "d3-scale";
import { timer, Timer } from "d3-timer";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/lab/Slider";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar, Typography as Text, Box, colors } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { InlineMath } from "react-katex";

type N = number;

const D = {
  car: 3,
  road: 10,
  total: 80
};

const w1 = 700,
  h1 = 175,
  margin = 0,
  WIDTH = w1 - 2 * margin,
  HEIGHT = h1 - 2 * margin,
  xScale = scaleLinear()
    .range([0, WIDTH])
    .domain([0, 4]);
  

const Road = CE("path", {
  d: `M0,${HEIGHT / 2}L${WIDTH},${HEIGHT / 2}M${WIDTH * 0.75},0L${WIDTH *
    0.75},${HEIGHT}`,
  strokeWidth: "50px",
  stroke: colors.grey["200"]
});

type CarProps = { x: N; y: N };
const Car: FunctionComponent<CarProps> = ({ x, y }) => {
  return CE("rect", {
    width: 20,
    height: 8,
    y: HEIGHT / 2 + y - 4,
    x,
    className: "hello",
    fill: colors.lightBlue.A200
  });
};

const Light: FunctionComponent<{ color: string }> = ({ color }) =>
  CE("line", {
    x1: WIDTH * 0.75 - 25 + 3,
    x2: WIDTH * 0.75 - 25 + 3,
    y1: HEIGHT / 2 - 25,
    y2: HEIGHT / 2 + 25,
    strokeWidth: 6,
    stroke: color
  });

const S0Line: FunctionComponent<{ x: number }> = (() => {
  let line = CE("line", {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 50,
    stroke: colors.grey["400"],
    strokeWidth: "3px"
  });
  let math = (
    <foreignObject width="30" height="30" y="50" x="-7">
      <InlineMath math="x_0" style="transform: translateX(-50%)" />
    </foreignObject>
  );
  return ({ x }: { x: number }) => (
    <g transform={`translate(${x},${HEIGHT / 2 - 25})`}>
      {line}
      {math}
    </g>
  );
})();

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.secondary.main,
    marginBottom: "15px"
  }
}))(Slider);

type cb = (...args: any[]) => void;

const a = 1;

function setTimer(callback: cb, play: boolean) {
  const savedTick = useRef<0 | cb>(0);
  savedTick.current = callback;
  useLayoutEffect(() => {
    if (play) {
      let last = 0,
        t = timer(elapsed => {
          let dt = (elapsed - last) / 1000;
          last = elapsed;
          if (savedTick.current) savedTick.current(dt);
        });
      return () => t.stop();
    }
  }, [play]);
}

const App: FunctionComponent<{}> = () => {
  const [play, setPlay] = useState(false),
    [s0, setS0] = useState(0.4),
    [v0, setV0] = useState(2),
    [stopper, setStopper] = useState({ s: 0, v: v0 }),
    [mover, setMover] = useState({ s: 0, v: v0 }),
    [time, setTime] = useState(0),
    [yellow, setYellow] = useState(2);

  setTimer((dt: N) => {
    if (mover.s < 4 || stopper.v !== 0) {
      setMover(({ s, v }) => ({ v, s: s + v * dt }));
      setTime(t => dt + t);
      setStopper(({ s, v }) => {
        if (s > s0)
          return {
            v: Math.max(v - a * dt, 0),
            s: Math.max(s + v * dt - 0.5 * a * dt * dt, s)
          };
        return { v, s: s + v * dt };
      });
    } else {
      setTime(0);
      setMover({ s: 0, v: v0 });
      setStopper({ s: 0, v: v0 });
    }
  }, play);

  return (
    <div className={style.main} style={{ maxWidth: "700px" }}>
      <svg width={w1} height={h1} className={style.svg}>
        <g transform={`translate(${margin},${margin})`}>
          {Road}
          <S0Line x={xScale(s0)} />
          <Car x={xScale(mover.s)} y={-10} />
          <Car x={xScale(stopper.s)} y={10} />
          <Light
            color={
              mover.s < s0
                ? colors.green["400"]
                : time > yellow
                ? colors.red["A200"]
                : colors.yellow["700"]
            }
          />
        </g>
      </svg>
      <Paper className={style.paper} elevation={2}>
        <Text variant="body1">
          <InlineMath math="x_0" /> (position when light turns green → yellow)
        </Text>
        <StyleSlider
          onChange={(e, val: N) => setS0(val)}
          value={s0}
          step={0.02}
          min={0}
          max={1.5}
        />
        <Text variant="body1">
          <InlineMath math="v_0" /> (speed when light changes green → yellow)
        </Text>
        <StyleSlider
          onChange={(e, val: N) => setV0(val)}
          value={v0}
          step={0.1}
          min={0}
          max={3}
        />
        <Text variant="body1">
          <InlineMath math="y" /> (yellow light duration)
        </Text>
        <StyleSlider
          onChange={(e, val: N) => setYellow(val)}
          value={yellow}
          step={0.1}
          min={0}
          max={3}
        />
        <Button
          className={style.button}
          variant="contained"
          color="secondary"
          onClick={() => setPlay(play => !play)}
        >
          {play ? "PAUSE" : "PLAY"}
        </Button>
        <Button
          className={style.button}
          style={{ marginTop: "10px" }}
          variant="contained"
          color="secondary"
          onClick={() => {
            setMover(({ s, v }) => ({ v: v0, s: 0 }));
            setStopper(({ s, v }) => ({ v: v0, s: 0 }));
            setPlay(false);
          }}
        >
          Reset
        </Button>
      </Paper>
    </div>
  );
};

type StateDispatcher<T> = Dispatch<SetStateAction<T>>;

export default () => (
  <div>
    <AppBar position="static">
      <Toolbar>hello</Toolbar>
    </AppBar>
    <App />
  </div>
);

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
