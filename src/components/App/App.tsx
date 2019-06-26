import React, { createElement as CE, FunctionComponent, useState } from "react";
// import style from "./styleApp.scss";
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
  "@global": {
    body: {
      margin: "0 !important",
      padding: "0 !important",
      fontFamily: " 'Puritan', sans-serif"
    }
  },
  main: {
    maxWidth: "900px",
    color: colors.grey["800"],
    margin: "0 auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  },
  red: {
    fill: colors.red["A400"]
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
    margin: "0 auto"
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
    setX0: setter;
    setV0: setter;
    setYellow: setter;
    x0: number;
    v0: number;
    yellow: number;
  }) => (
    <>
      {x0Text}
      <StyleSlider
        onChange={(e, val: number) => props.setX0(val)}
        value={props.x0}
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
    [x0, setX0] = useState(widths.start - 10),
    [v0, setV0] = useState(params.v0),
    [stopper, setStopper] = useState({ x: widths.start, v: v0 }),
    [mover, setMover] = useState({ x: widths.start, v: v0 }),
    [time, setTime] = useState(0),
    [yellow, setYellow] = useState(2);

  const classes = useStyles();
  const xssd = getxssd(v0);
  const xcl = getxcl(v0, yellow);

  useTimer((dt: number) => {
    dt /= params.delta;
    if (mover.x > widths.start - widths.total || stopper.v > 0) {
      setMover(({ x, v }) => ({ v, x: x - v * dt }));
      setTime(t => dt + t);
      setStopper(({ x, v }) => {
        if (x <= Math.min(xssd - v0 * params.tp, x0))
          return {
            v: Math.max(v - params.a * dt, 0),
            x: Math.min(x - v * dt + 0.5 * params.a * dt * dt, x)
          };
        return { v, x: x - v * dt };
      });
    } else {
      setTimeout(() => {
        setTime(0);
        setMover({ x: widths.start, v: v0 });
        setStopper({ x: widths.start, v: v0 });
      }, 200);
    }
  }, play);

  return (
    <div className={classes.main}>
      <div className={classes.visContainer}>
        {Vis({
          mover,
          stopper,
          xcl,
          x0,
          lightColor: mover.x > x0 ? "green" : time > yellow ? "red" : "yellow",
          xssd
        })}
      </div>
      <Paper className={classes.paper} elevation={2}>
        {Sliders({
          setX0,
          setV0,
          setYellow,
          x0,
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
            setMover(({ x, v }) => ({ v: v0, x: widths.start }));
            setStopper(({ x, v }) => ({ v: v0, x: widths.start }));
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
