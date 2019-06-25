import React, { createElement as CE, FunctionComponent, useState } from "react";
import style from "./styleApp.scss";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/lab/Slider";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar, Typography as Text } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import useTimer from "src/useTimerHook";
import { InlineMath } from "react-katex";
import Vis from "src/components/Vis";
// import memoizeone from "memoize-one";
import { params, widths } from "src/constants";

const StyleSlider = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.secondary.main,
    marginBottom: "15px"
  }
}))(Slider);

const App: FunctionComponent<{}> = () => {
  const [play, setPlay] = useState(false),
    [s0, setS0] = useState(widths.start - 10),
    [v0, setV0] = useState(params.v0),
    [stopper, setStopper] = useState({ s: widths.start, v: v0 }),
    [mover, setMover] = useState({ s: widths.start, v: v0 }),
    [time, setTime] = useState(0),
    [yellow, setYellow] = useState(2);

  useTimer((dt: number) => {
    dt /= params.delta;
    if (mover.s > widths.start - widths.total && mover.v > 0) {
      setMover(({ s, v }) => ({ v, s: s - v * dt }));
      setTime(t => dt + t);
      setStopper(({ s, v }) => {
        if (s < s0)
          return {
            v: Math.max(v - params.a * dt, 0),
            s: Math.min(s - v * dt + 0.5 * params.a * dt * dt, s)
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
      {Vis({
        mover,
        stopper,
        s0,
        lightColor: mover.s > s0 ? "green" : time > yellow ? "red" : "yellow"
      })}
      {/* <Vis /> */}
      <Paper className={style.paper} elevation={2}>
        <Text variant="body1">
          <InlineMath math="x_0" /> (position when light turns green → yellow)
        </Text>
        <StyleSlider
          onChange={(e, val: number) => setS0(val)}
          value={s0}
          step={0.02}
          min={0}
          max={widths.start}
        />
        <Text variant="body1">
          <InlineMath math="v_0" /> (speed when light changes green → yellow)
        </Text>
        <StyleSlider
          onChange={(e, val: number) => setV0(val)}
          value={v0}
          step={0.1}
          min={0}
          max={params.v0 * 2}
        />
        <Text variant="body1">
          <InlineMath math="t_y" /> (yellow light duration)
        </Text>
        <StyleSlider
          onChange={(e, val: number) => setYellow(val)}
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

export default () => (
  <div>
    <AppBar position="static">
      <Toolbar>hello</Toolbar>
    </AppBar>
    <App />
  </div>
);
