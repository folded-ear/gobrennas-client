import { Photo } from "@/__generated__/graphql";
import { CardMedia, SxProps, useTheme } from "@mui/material";
import { CommonProps } from "@mui/material/OverridableComponent";
import { Theme } from "@mui/material/styles";
import * as React from "react";

interface Props extends CommonProps {
    photo: Photo;
    alt: string;
    sx?: SxProps<Theme>;
}

const ItemImage: React.FC<Props> = ({ photo, alt, sx = {}, ...props }) => {
    const theme = useTheme();
    const f = photo.focus;
    const x = f ? f[0] * 100 : 50;
    const y = f ? f[1] * 100 : 50;

    return (
        <CardMedia
            image={photo.url}
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
