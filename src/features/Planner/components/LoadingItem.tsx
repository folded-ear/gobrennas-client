import ListItemText from "@mui/material/ListItemText";
import React from "react";
import LoadingIconButton from "@/views/common/LoadingIconButton";
import Item from "./Item";
import { grey } from "@mui/material/colors";

interface Props {
    depth: number;
}

const LoadingItem: React.FC<Props> = ({ depth }) => {
    return (
        <Item depth={depth} prefix={<LoadingIconButton key="loading" />}>
            <ListItemText style={{ color: grey[500] }}>Loading...</ListItemText>
        </Item>
    );
};

export default LoadingItem;
