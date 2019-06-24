import React, {
  createElement as CE,
  FC,
  useEffect,
  useRef,
  useLayoutEffect,
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
const w1 = 500,
  h1 = 250,
  margin = 25,
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

type CarProps = { x: N };
const Car: FC<CarProps> = ({ x }) =>
  CE("rect", {
    transform: `translate(${x} ${HEIGHT / 2})`,
    width: 20,
    height: 8,
    x: -10,
    y: -4,
    fill: colors.lightBlue.A200
  });

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.secondary.main,
    marginBottom: "15px"
  }
}))(Slider);

type cb = (...args: any[]) => void;

const App: FC = () => {
  const [play, setPlay] = useState(false);
  const [s0, setS0] = useState(0.4);
  const [s, setS] = useState(s0);
  const [v0, setV0] = useState(0.002);
  const [v, setV] = useState(v0);

  const savedCallback = useRef<0 | cb>(0);
  savedCallback.current = (dt: number) => {
    if (s < 3) setS(s + v * dt);
    else {
      setV(v0);
      setS(s0);
    }
  };

  useLayoutEffect(() => {
    if (play) {
      let last = 0,
        t = timer(elapsed => {
          let dt = elapsed - last;
          last = elapsed;
          if (savedCallback.current) savedCallback.current(dt);
        });
      return () => t.stop();
    }
  }, [play]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>hello</Toolbar>
      </AppBar>
      <div className={style.main}>
        <svg width={w1} height={h1} style={{ display: "inline-block" }}>
          <g transform={`translate(${margin},${margin})`}>
            {Road}
            <Car x={xScale(s)} />
          </g>
        </svg>
        <Paper className={style.paper}>
          <Text variant="body1">
            <InlineMath math="s_0" />
          </Text>

          <StyleSlider
            onChange={(e, v: N) => setS0(v)}
            value={s0}
            step={0.1}
            min={0}
            max={4}
          />
          <Text variant="body1">
            <InlineMath math="v_0" />
          </Text>
          <StyleSlider
            onChange={(e, val: N) => setV0(val)}
            value={v0}
            step={0.0001}
            min={0}
            max={0.025}
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
              setS(0);
              setPlay(false);
            }}
          >
            Reset
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
