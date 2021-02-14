import { AddAPhoto } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import ImageOrPreview from "../views/common/ImageOrPreview";
import buildSequence from "./buildSequence";

const {next} = buildSequence();

const ImageDropZone = ({image, onImage, maxWidth, maxHeight, ...props}) => {
    const [value, setValue] = React.useState([]);

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

    const inputId = `image-drop-zone-${next()}`;
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
                    style={{
                        maxWidth: maxWidth || "400px",
                        maxHeight: maxHeight || "200px",
                    }}
                />
                : <AddAPhoto
                    color="disabled"
                    style={{
                        margin: "30px 40px",
                    }}
                />}
            <input
                id={inputId}
                accept="image/*"
                type="file"
                style={{
                    opacity: 0,
                    height: 0,
                    width: 0,
                }}
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
};

export default ImageDropZone;
