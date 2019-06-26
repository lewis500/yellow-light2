import React, { createElement as CE, FunctionComponent } from "react";
import { widths } from "src/constants";
import { InlineMath } from "react-katex";
import { colors } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import style from "./styleVis.scss";

const WIDTH = 700,
  HEIGHT = 175,
  H2 = HEIGHT / 2,
  scale = scaleLinear()
    .range([0, WIDTH])
    .domain([widths.start, widths.start - widths.total]);

const lightColors = {
  green: colors.green["400"],
  red: colors.red["A200"],
  yellow: colors.yellow["700"]
};

const START = scale(0),
  ROAD_WIDTH = START - scale(widths.road),
  CAR_WIDTH = START - scale(widths.car.width),
  CAR_HEIGHT = START - scale(widths.car.height),
  R2 = ROAD_WIDTH / 2;

export const Road = CE(
  "g",
  {},
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
);

export const Car: FunctionComponent<{ x: number; y: number }> = ({ x, y }) => {
  return CE("rect", {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    y: H2 + y - 4,
    x: x - CAR_WIDTH,
    className: "hello",
    fill: colors.lightBlue.A200
  });
};

export const Light: FunctionComponent<{ color: string }> = ({ color }) =>
  CE("line", {
    x1: START,
    x2: START,
    y1: H2 - R2,
    y2: H2 + R2,
    strokeWidth: 6,
    stroke: color
  });

export const S0Line: FunctionComponent<{ x: number }> = (() => {
  const line1 = CE("line", {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: R2 - 10,
    stroke: colors.grey["800"],
    strokeWidth: "2px"
  });
  const line2 = CE("line", {
    x1: 0,
    x2: 0,
    y1: R2 + 11,
    y2: ROAD_WIDTH,
    stroke: colors.grey["800"],
    strokeWidth: "2px"
  });
  const math = (
    <foreignObject width="30" height="30" y={R2 - 11} x="-7">
      <InlineMath math="x_0" />
    </foreignObject>
  );
  return ({ x }: { x: number }) => (
    <g transform={`translate(${x},${H2 - R2})`}>
      {line1}
      {line2}
      {math}
    </g>
  );
})();

const XssdLine: FunctionComponent<{ x: number }> = (() => {
  let math = (
    <foreignObject width="40" height="50" x="-8" y="2">
      <InlineMath>{"x_{\\text{ssd}} "}</InlineMath>
    </foreignObject>
  );
  return ({ x }: { x: number }) => (
    <g transform={`translate(${x},${H2 + R2 + 3})`}>
      {x > 45 && (
        <foreignObject width="40" height="80" x={-x / 2 - 20} y={6}>
          <div className={style.text}>CAN STOP</div>
        </foreignObject>
      )}
      {math}
      {CE("line", {
        markerStart: "url(#arrow)",
        stroke: colors.blue["400"],
        strokeWidth: 2,
        x2: -x,
        x1: 0
      })}
    </g>
  );
})();

const XclLine: FunctionComponent<{ x: number }> = (() => {
  let math = (
    <foreignObject width="30" height="30" x="-8" y="-30">
      <InlineMath>{"x_{\\text{cl}} "}</InlineMath>
    </foreignObject>
  );

  return ({ x }: { x: number }) => (
    <g transform={`translate(${x},${H2 - R2 - 3})`}>
      {math}
      <foreignObject width="45" height="80" x={START / 2 - x / 2 - 20} y={-35}>
        <div className={style.text}>CAN CLEAR</div>
      </foreignObject>
      {CE("line", {
        markerEnd: "url(#arrow2)",
        stroke: colors.deepOrange.A400,
        strokeWidth: 2,
        x2: 0,
        x1: START - x
      })}
    </g>
  );
})();

const Vis: FunctionComponent<{
  mover: { s: number };
  stopper: { s: number };
  s0: number;
  lightColor: "red" | "green" | "yellow";
  xssd: number;
  xcl: number;
}> = ({ mover, stopper, s0, lightColor, xssd, xcl }) => (
  <svg width={WIDTH} height={HEIGHT} className={style.svg}>
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 15 15"
        refY="5"
        refX="8"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
        fill={colors.blue["400"]}
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker
        id="arrow2"
        viewBox="0 0 15 15"
        refY="5"
        refX="8"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
        fill={colors.deepOrange.A400}
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <g>
      {Road}
      <S0Line x={scale(s0)} />
      <XssdLine x={scale(xssd)} />
      <XclLine x={scale(xcl)} />
      <Light color={lightColors[lightColor]} />
      <Car x={scale(mover.s)} y={-15} />
      <Car x={scale(stopper.s)} y={15} />
    </g>
  </svg>
);
export default Vis;
