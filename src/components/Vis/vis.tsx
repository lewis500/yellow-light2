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

export const Road = CE("g", {}, [
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
  const line = CE("line", {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: ROAD_WIDTH,
    stroke: colors.grey["800"],
    strokeWidth: "2px"
  });
  const math = (
    <foreignObject width="30" height="30" y={ROAD_WIDTH} x="-7">
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

const Vis: FunctionComponent<{
  mover: { s: number };
  stopper: { s: number };
  s0: number;
  lightColor: "red" | "green" | "yellow";
}> = ({ mover, stopper, s0, lightColor }) => (
  <svg width={WIDTH} height={HEIGHT} className={style.svg}>
    <g>
      {Road}
      <S0Line x={scale(s0)} />
      <Car x={scale(mover.s)} y={-15} />
      <Car x={scale(stopper.s)} y={15} />
      <Light color={lightColors[lightColor]} />
    </g>
  </svg>
);
export default Vis;
