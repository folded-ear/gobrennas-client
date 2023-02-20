import SvgIcon from "@material-ui/core/SvgIcon";
import PropTypes from "prop-types";
import React from "react";

const Bar = ({y=12}) =>
    <g transform={`translate(12, ${y})`}>
        <rect x={-10} y={-1} width={20} height={2} />
    </g>;

Bar.propTypes = {
    y: PropTypes.number,
};

const Caret = ({y=12, transform = ""}) =>
    <g transform={`translate(12, ${y})`}>
        <g transform={transform}>
            <polygon points={`-6,3 6,3 0,-3`} />
        </g>
    </g>;

Caret.propTypes = {
    y: PropTypes.number,
    transform: PropTypes.string,
};

export const ExpandAll = () =>
    <SvgIcon>
        <Bar y={2} />
        <Caret y={7} transform="scale(0.8)" />
        <Caret y={17} transform="rotate(180) scale(0.8)" />
        <Bar y={22} />
    </SvgIcon>;

export const CollapseAll = () =>
    <SvgIcon>
        <Caret y={6} transform="rotate(180)" />
        <Bar y={12} />
        <Caret y={18} />
    </SvgIcon>;

export const Blank = () =>
    <SvgIcon />;
