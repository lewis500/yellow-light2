import React, { FunctionComponent, useContext, useReducer } from "react";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";
import { Toolbar, Typography as Text, colors } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import useTimer from "src/useTimerHook";
import Vis from "src/components/Vis";
import Plot from "src/components/Plot";
import { params, widths } from "src/constants";
import { makeStyles } from "@material-ui/styles";
import { AppContext, getxssd, getxcl, reducer, initialState } from "src/ducks";
import TeX from "@matejmazur/react-katex";

const useStyles = makeStyles({
  "@global": {
    body: {
      margin: "0 !important",
      padding: "0 !important",
      fontFamily: " 'Puritan', sans-serif"
    }
  },
  main: {
    // maxWidth: "900px",
    color: colors.grey["800"],
    margin: "0 auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
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
    // alignSelf: "center"
  },
  visContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingRight: "30px"

    // margin: "0 auto"
  },
  sliderContainer: {
    width: "300px",
    padding: "20px",
    boxSizing: "border-box"
  },
  title: {
    backgroundColor: colors.lightBlue["A700"],
    color: "white",
    width: "100%",
    height: "70px",
    display: "flex",
    fontFamily: "Helvetica",
    boxShadow: " 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
    marginBottom: "25px",
    alignItems: "center",
    padding: "5px 30px",
    fontSize: "22px",
    boxSizing: "border-box",
    "& a": {
      color: "white",
      textDecoration: "none"
    },
    "& a:hover": {
      color: colors.pink["100"],
      cursor: "pointer"
    }
  }
});

// type setter = React.Dispatch<React.SetStateAction<number>>;
const Sliders = (() => {
  const StyleSlider = withStyles((theme: Theme) => ({
    root: {
      color: theme.palette.primary.main,
      marginBottom: "15px"
    }
  }))(Slider);
  const x0Text = (
    <Text variant="body1">
      <TeX math="x_0" /> (position when light turns green → yellow)
    </Text>
  );
  const v0Text = (
    <Text variant="body1">
      <TeX math="v_0" /> (speed when light changes green → yellow)
    </Text>
  );
  const yellowText = (
    <Text variant="body1">
      <TeX math="t_y" /> (yellow light duration)
    </Text>
  );

  return () => {
    const { state, dispatch } = useContext(AppContext);
    const { x0, v0, yellow } = state;
    return (
      <>
        {x0Text}
        <StyleSlider
          onChange={(e, payload: number) =>
            dispatch({ type: "SET_X0", payload })
          }
          value={x0}
          step={0.02}
          min={0}
          max={widths.start}
        />
        {v0Text}
        <StyleSlider
          onChange={(e, payload: number) =>
            dispatch({ type: "SET_V0", payload })
          }
          value={v0}
          step={0.1}
          min={0}
          max={params.v0Max}
        />
        {yellowText}
        <StyleSlider
          onChange={(e, payload: number) =>
            dispatch({ type: "SET_YELLOW", payload })
          }
          value={yellow}
          step={0.1}
          min={0}
          max={params.yellowMax}
        />
      </>
    );
  };
})();

const EMPTY = {};
const App: FunctionComponent<{}> = () => {
  const { state, dispatch } = useContext(AppContext);
  const { x0, v0, stopper, mover, time, play, yellow } = state;

  const classes = useStyles(EMPTY);
  const xssd = getxssd(v0);
  const xcl = getxcl(v0, yellow);

  useTimer((dt: number) => {
    dt /= params.delta;
    if (mover.x > widths.start - widths.total || stopper.v > 0) {
      dispatch({ type: "TICK", payload: { dt, xssd } });
    } else {
      setTimeout(() => {
        dispatch({ type: "RESTART" });
      }, 0);
    }
  }, play);

  return (
    <>
      <div className={classes.title}>
        <div>Construction Zone</div>
      </div>
      <div className={classes.main}>
        <div className={classes.visContainer}>
          <div style={{ marginBottom: "30px" }}>
            {Vis({
              mover,
              stopper,
              xcl,
              x0,
              lightColor:
                time < (widths.start - x0) / v0
                  ? "green"
                  : time - (widths.start - x0) / v0 < yellow
                  ? "yellow"
                  : "red",
              xssd
            })}
          </div>
          <Plot />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Sliders />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around"
            }}
          >
            <Button
              className={classes.button}
              variant="contained"
              color="secondary"
              onClick={() => dispatch({ type: "SET_PLAY", payload: !play })}
            >
              {play ? "PAUSE" : "PLAY"}
            </Button>
            <Button
              className={classes.button}
              variant="contained"
              color="secondary"
              component="div"
              onClick={() => {
                dispatch({ type: "RESET" });
              }}
            >
              Reset
            </Button>
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <App />
    </AppContext.Provider>
  );
};
