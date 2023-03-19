import {CardMedia} from "@mui/material";
import React from "react";
import {CommonProps} from "@mui/material/OverridableComponent";
import {Maybe} from "graphql/jsutils/Maybe";

interface Props extends CommonProps {
    url: string,
    focus?: Maybe<number[]>,
    title: string,
    style?: object,
}

const ItemImage = ({url, focus, title, style = {}, ...props}: Props) => {
    const x = focus ? focus[0] * 100 : 50;
    const y = focus ? focus[1] * 100 : 50;

    return (<CardMedia
        image={url}
        title={title}
        {...props}
        style={{
            ...style,
            backgroundPosition: `${x == null ? 50 : x}% ${y == null ? 50 : y}%`
        }}
    />);
};

export default ItemImage;
