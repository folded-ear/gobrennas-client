import { makeStyles } from "@material-ui/core/styles";
import {
    AddAPhoto,
    PhotoCamera,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import ImageOrPreview from "../views/common/ImageOrPreview";
import buildSequence from "./buildSequence";

const {next} = buildSequence();

const useStyles = makeStyles(({maxWidth, maxHeight}) => ({
    preview: {
        maxWidth: maxWidth || "400px",
        maxHeight: maxHeight || "200px",
    },
    icon: {
        margin: "30px 40px",
    },
    input: {
        opacity: 0,
        height: 0,
        width: 0,
    },
}));

const ImageDropZone = ({
                           disabled,
                           image,
                           onImage,
                           maxWidth,
                           maxHeight,
                           ...props
                       }) => {
    const classes = useStyles({maxWidth, maxHeight});
    const [value, setValue] = React.useState([]);
    const inputId = React.useMemo(
        () => `image-drop-zone-${next()}`,
        []
    );

    if (disabled) {
        return <label
            {...props}
        >
            <PhotoCamera
                color="disabled"
                className={classes.icon}
            />
        </label>;
    }

    const sendOffFirstFile = files => {
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.type.indexOf("image/") !== 0) continue;
            onImage(f);
            setValue([]);
            break;
        }
    };

    const handleDragOver = event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = event => {
        event.preventDefault();
        const dt = event.dataTransfer;
        const files = dt.files;
        sendOffFirstFile(files);
    };

    const handleFileSelect = event => {
        sendOffFirstFile(event.target.files);
    };

    return (
        <label
            title="Drag and drop an image, or click to select one."
            {...props}
            htmlFor={inputId}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {image
                ? <ImageOrPreview
                    src={image}
                    alt={""}
                    className={classes.preview}
                />
                : <AddAPhoto
                    color="disabled"
                    className={classes.icon}
                />}
            <input
                id={inputId}
                accept="image/*"
                type="file"
                className={classes.input}
                value={value}
                onChange={handleFileSelect}
            />
        </label>);
};

ImageDropZone.propTypes = {
    image: PropTypes.any, // URL (as string) or Blob (File) object
    maxWidth: PropTypes.any,
    maxHeight: PropTypes.any,
    onImage: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
};

export default ImageDropZone;
