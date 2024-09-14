import { CardMedia, SxProps, useTheme } from "@mui/material";
import React from "react";
import { CommonProps } from "@mui/material/OverridableComponent";
import { Maybe } from "graphql/jsutils/Maybe";
import { Theme } from "@mui/material/styles";

interface Props extends CommonProps {
    image: string;
    focus?: Maybe<number[]>;
    alt: string;
    sx?: SxProps<Theme>;
}

const ItemImage: React.FC<Props> = ({
    image,
    focus,
    alt,
    sx = {},
    ...props
}) => {
    const x = focus ? focus[0] * 100 : 50;
    const y = focus ? focus[1] * 100 : 50;
    const theme = useTheme();

    return (
        <CardMedia
            image={image}
            title={alt}
            {...props}
            sx={{
                ...sx,
                backgroundColor: theme.palette.background.paper,
                backgroundPosition: `${x == null ? 50 : x}% ${
                    y == null ? 50 : y
                }%`,
            }}
        />
    );
};

export default ItemImage;
