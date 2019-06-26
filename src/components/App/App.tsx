import React, { createElement as CE, FunctionComponent, useState } from "react";
import style from "./styleApp.scss";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/lab/Slider";
import AppBar from "@material-ui/core/AppBar";
import { Toolbar, Typography as Text, colors } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import useTimer from "src/useTimerHook";
import { InlineMath } from "react-katex";
import Vis from "src/components/Vis";
import memoizeone from "memoize-one";
import { params, widths } from "src/constants";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  main: {
    maxWidth: "900px",
    color: colors.grey["800"],
    margin: "0 auto",
    boxSizing: "border-box",
    display: 'flex',
    flexDirection: 'column'
  },
  paper: {
    maxWidth: "500px",
    margin: "auto",
    display: "flex",
    padding: "24px 36px",
    flexDirection: "column"
  },
  button: {
    alignSelf: "center"
  },
  visContainer: {
    margin: '0 auto',
  },
  sliderContainer: {
    width: "300px",
    padding: "20px",
    boxSizing: "border-box"
  }
});

type setter = React.Dispatch<React.SetStateAction<number>>;
const Sliders = (() => {
  const StyleSlider = withStyles((theme: Theme) => ({
    root: {
      color: theme.palette.primary.main,
      marginBottom: "15px"
    }
  }))(Slider);
  const x0Text = (
    <Text variant="body1">
      <InlineMath math="x_0" /> (position when light turns green → yellow)
    </Text>
  );
  const v0Text = (
    <Text variant="body1">
      <InlineMath math="v_0" /> (speed when light changes green → yellow)
    </Text>
  );
  const yellowText = (
    <Text variant="body1">
      <InlineMath math="t_y" /> (yellow light duration)
    </Text>
  );

  return (props: {
    setS0: setter;
    setV0: setter;
    setYellow: setter;
    s0: number;
    v0: number;
    yellow: number;
  }) => (
    <>
      {x0Text}
      <StyleSlider
        onChange={(e, val: number) => props.setS0(val)}
        value={props.s0}
        step={0.02}
        min={0}
        max={widths.start}
      />
      {v0Text}
      <StyleSlider
        onChange={(e, val: number) => props.setV0(val)}
        value={props.v0}
        step={0.1}
        min={0}
        max={params.v0 * 2}
      />
      {yellowText}
      <StyleSlider
        onChange={(e, val: number) => props.setYellow(val)}
        value={props.yellow}
        step={0.1}
        min={0}
        max={6}
      />
    </>
  );
})();

const getxssd = memoizeone(
  (v0: number) => v0 * params.tp + (v0 * v0) / 2 / params.a
);
const getxcl = memoizeone((v0: number, yellow: number) => v0 * yellow);

const App: FunctionComponent<{}> = () => {
  const [play, setPlay] = useState(false),
    [s0, setS0] = useState(widths.start - 10),
    [v0, setV0] = useState(params.v0),
    [stopper, setStopper] = useState({ s: widths.start, v: v0 }),
    [mover, setMover] = useState({ s: widths.start, v: v0 }),
    [time, setTime] = useState(0),
    [yellow, setYellow] = useState(2);

  const classes = useStyles();
  const xssd = getxssd(v0);
  const xcl = getxcl(v0, yellow);

  useTimer((dt: number) => {
    dt /= params.delta;
    if (mover.s > widths.start - widths.total || stopper.v > 0) {
      setMover(({ s, v }) => ({ v, s: s - v * dt }));
      setTime(t => dt + t);
      setStopper(({ s, v }) => {
        if (s <= Math.min(xssd - v0 * params.tp, s0))
          return {
            v: Math.max(v - params.a * dt, 0),
            s: Math.min(s - v * dt + 0.5 * params.a * dt * dt, s)
          };
        return { v, s: s - v * dt };
      });
    } else {
      setTimeout(() => {
        setTime(0);
        setMover({ s: widths.start, v: v0 });
        setStopper({ s: widths.start, v: v0 });
      }, 200);
    }
  }, play);
  console.log(classes);

  return (
    <div className={classes.main}>
      <div className={classes.visContainer}>
        {Vis({
          mover,
          stopper,
          xcl,
          s0,
          lightColor: mover.s > s0 ? "green" : time > yellow ? "red" : "yellow",
          xssd
        })}
      </div>
      <Paper className={classes.paper} elevation={2}>
        {Sliders({
          setS0,
          setV0,
          setYellow,
          s0,
          v0,
          yellow
        })}
        <Button
          className={classes.button}
          variant="contained"
          color="secondary"
          onClick={() => setPlay(play => !play)}
        >
          {play ? "PAUSE" : "PLAY"}
        </Button>
        <Button
          className={classes.button}
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

export default App;

// export default () => (
//   <div>
//     <AppBar position="static">
//       <Toolbar>hello</Toolbar>
//     </AppBar>
//     <App />
//   </div>
// );
