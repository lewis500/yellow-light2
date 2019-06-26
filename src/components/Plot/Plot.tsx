import React, { createElement as CE, FunctionComponent, useState, useLayoutEffect, useRef } from "react";
import { params, widths } from "../../constants";
import { makeStyles } from "@material-ui/styles";
import { select } from "d3-selection";
import { axisLeft } from "d3-axis";


const useStyles = makeStyles({
    svg: {
        width: '400px'
    }
});

const xAxis = axisLeft().domain([0,4])

const Plot:FunctionComponent<{s0:number,v0:number}> = ({s0,v0})=>{
    const classes = useStyles({});
    const gAxis = useRef<SVGGElement>();
    useLayoutEffect(()=>{
        select(gAxis.current)

    },[])
    return (
        <svg className={classes.svg}>
            <g ref={gAxis}></g>
        </svg>
    )
};
export default Plot;

// export default kk