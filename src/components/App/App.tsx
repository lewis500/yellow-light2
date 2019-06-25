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

const widths = {
  car: {
    width: 3,
    height: 1
  },
  road: 8,
  total: 80,
  start: 60
};

const constants = {
  a: 3.4,
  v0: 18
};

const WIDTH = 700,
  HEIGHT = 175,
  H2 = HEIGHT / 2,
  scale = scaleLinear()
    .range([0, WIDTH])
    .domain([widths.start, widths.start - widths.total]);

const START = scale(0),
  ROAD_WIDTH = START - scale(widths.road),
  CAR_WIDTH = START - scale(widths.car.width),
  CAR_HEIGHT = START - scale(widths.car.height),
  R2 = ROAD_WIDTH / 2;

const Road = CE("g", {}, [
  CE("rect", {
    height: ROAD_WIDTH,
    width: WIDTH,
    x: 0,
    y: H2 - R2,
    className: style.road
  }),
  CE("rect", {
    height: HEIGHT,
    width: ROAD_WIDTH,
    x: START,
    y: 0,
    className: style.road
  })
]);

type CarProps = { x: N; y: N };
const Car: FunctionComponent<CarProps> = ({ x, y }) => {
  return CE("rect", {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    y: H2 + y - 4,
    x,
    className: "hello",
    fill: colors.lightBlue.A200
  });
};

const Light: FunctionComponent<{ color: string }> = ({ color }) =>
  CE("line", {
    x1: START + 3,
    x2: START + 3,
    y1: H2 - R2,
    y2: H2 + R2,
    strokeWidth: 6,
    stroke: color
  });

const S0Line: FunctionComponent<{ x: number }> = (() => {
  const line = CE("line", {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: ROAD_WIDTH,
    stroke: colors.grey["400"],
    strokeWidth: "3px"
  });
  const math = (
    <foreignObject width="30" height="30" y="50" x="-7">
      <InlineMath math="x_0" />
    </foreignObject>
  );
  return ({ x }: { x: number }) => (
    <g transform={`translate(${x},${H2 - R2})`}>
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
    [s0, setS0] = useState(widths.start - 10),
    [v0, setV0] = useState(constants.v0),
    [stopper, setStopper] = useState({ s: widths.start, v: v0 }),
    [mover, setMover] = useState({ s: widths.start, v: v0 }),
    [time, setTime] = useState(0),
    [yellow, setYellow] = useState(2);

  setTimer((dt: N) => {
    if (mover.s > widths.start - widths.total && mover.v > 0 ) {
      setMover(({ s, v }) => ({ v, s: s - v * dt }));
      setTime(t => dt + t);
      setStopper(({ s, v }) => {
        if (s < s0)
          return {
            v: Math.max(v - constants.a * dt, 0),
            s: Math.min(s - v * dt + 0.5 * constants.a * dt * dt, s)
          };
        return { v, s: s - v * dt };
      });
    } else {
      setTime(0);
      setMover({ s: widths.start, v: v0 });
      setStopper({ s: widths.start, v: v0 });
    }
  }, play);

  return (
    <div className={style.main} style={{ maxWidth: "700px" }}>
      <svg width={WIDTH} height={HEIGHT} className={style.svg}>
        <g>
          {Road}
          <S0Line x={scale(s0)} />
          <Car x={scale(mover.s)} y={-15} />
          <Car x={scale(stopper.s)} y={15} />
          <Light
            color={
              mover.s > s0
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
          max={widths.start}
        />
        <Text variant="body1">
          <InlineMath math="v_0" /> (speed when light changes green → yellow)
        </Text>
        <StyleSlider
          onChange={(e, val: N) => setV0(val)}
          value={v0}
          step={0.1}
          min={0}
          max={constants.v0 * 2}
        />
        <Text variant="body1">
          <InlineMath math="y" /> (yellow light duration)
        </Text>
        <StyleSlider
          onChange={(e, val: N) => setYellow(val)}
          value={yellow}
          step={0.1}
          min={0}
          max={6}
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
            setMover(({ s, v }) => ({ v: v0, s: widths.start }));
            setStopper(({ s, v }) => ({ v: v0, s: widths.start }));
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
