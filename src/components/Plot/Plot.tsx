import React, {
  createElement as CE,
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useContext,
  Dispatch
} from "react";
import { params, widths } from "../../constants";
import { makeStyles } from "@material-ui/styles";
import { select, event } from "d3-selection";
import { axisLeft, axisBottom } from "d3-axis";
import { AppContext } from "src/ducks";
import { scaleLinear } from "d3-scale";
import memoizeone from "memoize-one";
import { colors } from "@material-ui/core";
import { drag } from "d3-drag";
import TeX from "@matejmazur/react-katex";
import 'katex/dist/katex.min.css';

const WIDTH = 400;
const HEIGHT = WIDTH*2/3;
const M = {
    top: 10,
    bottom: 40,
    left: 40,
    right: 10
  },
  useStyles = makeStyles({
    svg: {
      width: WIDTH + M.left + M.right,
      height: HEIGHT + M.top + M.bottom,
      "& text": {
        fontFamily: "Puritan, san-serif",
        fontSize: "13px"
      }
    },
    math: {
      fontSize: "12px"
    },
    dot: {
      stroke: "white",
      strokeWidth: 3,
      fill: colors.pink["500"],
      cursor: "pointer"
    },
    xssd: {
      fill: "none",
      strokeWidth: 2,
      stroke: colors.blue.A400
    },
    xcl: {
      fill: "none",
      strokeWidth: 2,
      stroke: colors.deepOrange.A400
    },
    hidden: {
      fill: "white",
      opacity: 0
    }
  }),
  xScale = scaleLinear()
    .domain([0, widths.start])
    .range([HEIGHT, 0]),
  vScale = scaleLinear()
    .domain([0, params.v0Max])
    .range([0, WIDTH]),
  xAxis = axisLeft(xScale),
  vAxis = axisBottom(vScale),
  getTranslate = memoizeone((vpx, xpx) => `translate(${vpx},${xpx})`),
  range: number[] = Array.apply(null, { length: 50 }).map(
    (d: {}, i: number) => i
  ),
  xssdPath =
    "M" +
    range
      .map(v => [vScale(v), xScale(params.tp * v + (v * v) / 2 / params.a)])
      .join("L"),
  getxclPath = memoizeone(
    (yellow: number) =>
      "M" +
      range
        .map(v => [vScale(v), xScale(-widths.car.width + v * yellow)])
        .join("L")
  );

const Plot: FunctionComponent = () => {
  const classes = useStyles({});
  const gXAxis = useRef<SVGGElement>();
  const gVAxis = useRef<SVGGElement>();
  const dragRect = useRef<SVGRectElement>();
  const dragDot = useRef<SVGCircleElement>();
  const { state, dispatch } = useContext(AppContext);
  const { v0, x0 } = state;
  // const dragRect = useRef<SV
  const dispatchRef = useRef(dispatch);
  // const
  useLayoutEffect(() => {
    select(gXAxis.current).call(xAxis);
    select(gVAxis.current).call(vAxis);
    const dragger = drag().on("drag", function() {
      dispatchRef.current({
        type: "DRAG",
        payload: {
          x0: xScale.invert(event.y),
          v0: vScale.invert(event.x)
        }
      });
    });
    select(dragDot.current).call(dragger);
  }, []);
  return (
    <svg className={classes.svg}>
      <g transform={getTranslate(M.left, M.top)}>
        <mask id="myMask">
          <rect width={WIDTH} height={HEIGHT} fill="white" />
        </mask>
        <rect className={classes.hidden} width={WIDTH} height={HEIGHT} />
        <g ref={gXAxis} />
        <g ref={gVAxis} transform={getTranslate(0, HEIGHT)} />
        <foreignObject
          width="90"
          height="75"
          transform={`translate(${10},${0})`}
        >
          <span className={classes.math}>
            <TeX math="x \; \text{(m)}" />
          </span>
        </foreignObject>
        <foreignObject
          width="90"
          height="75"
          transform={`translate(${WIDTH - 45},${HEIGHT - 20})`}
        >
          <span className={classes.math}>
            <TeX math="v \; \text{(m/s)}" />
          </span>
        </foreignObject>
        {/* <g transform={`translate(${WIDTH},${HEIGHT})`}> */}

        <path d={xssdPath} className={classes.xssd} mask="url(#myMask)" />
        <path
          d={getxclPath(state.yellow)}
          className={classes.xcl}
          mask="url(#myMask)"
        />
        <circle
          ref={dragDot}
          className={classes.dot}
          r="6"
          transform={`translate(${vScale(v0)},${xScale(x0)})`}
        />
        {/* </g> */}
      </g>
    </svg>
  );
};
export default Plot;
