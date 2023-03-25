import { CardMedia } from "@mui/material";
import React from "react";
import { CommonProps } from "@mui/material/OverridableComponent";
import { Maybe } from "graphql/jsutils/Maybe";

interface Props extends CommonProps {
    url: string,
    focus?: Maybe<number[]>,
    title: string,
    style?: object,
}

const ItemImage: React.FC<Props> = ({
                                        url,
                                        focus,
                                        title,
                                        style = {},
                                        ...props
                                    }) => {
    const x = focus ? focus[0] * 100 : 50;
    const y = focus ? focus[1] * 100 : 50;

    return (<CardMedia
        image={url}
        title={title}
        {...props}
        style={{
            ...style,
            backgroundPosition: `${x == null ? 50 : x}% ${y == null ? 50 : y}%`,
        }}
    />);
};

export default ItemImage;
