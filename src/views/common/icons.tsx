import SvgIcon from "@mui/material/SvgIcon";
import React from "react";

interface BarProps {
    y?: number,
}

const Bar: React.FC<BarProps> = ({ y = 12 }) =>
    <g transform={`translate(12, ${y})`}>
        <rect x={-10} y={-1} width={20} height={2} />
    </g>;

interface CaretProps {
    y?: number,
    transform?: string
}

const Caret: React.FC<CaretProps> = ({ y = 12, transform = "" }) =>
    <g transform={`translate(12, ${y})`}>
        <g transform={transform}>
            <polygon points={`-6,3 6,3 0,-3`} />
        </g>
    </g>;

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
