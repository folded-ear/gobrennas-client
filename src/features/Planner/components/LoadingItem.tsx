import LoadingIconButton from "@/views/common/LoadingIconButton";
import { grey } from "@mui/material/colors";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";
import Item from "./Item";

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
