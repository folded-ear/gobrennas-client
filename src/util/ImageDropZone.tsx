import { makeStyles } from "@mui/styles";
import { AddPhotoIcon, NoPhotoIcon } from "views/common/icons";
import clsx from "clsx";
import * as React from "react";
import { DragEvent } from "react";
import ImageOrPreview from "../views/common/ImageOrPreview";
import buildSequence from "./buildSequence";

const { next } = buildSequence();

const useStyles = makeStyles(
    ({ maxWidth, maxHeight }: { maxWidth: any; maxHeight: any }) => ({
        label: {
            cursor: "pointer",
        },
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
    }),
);

type ImageDropZoneProps = {
    onImage(f: File): void;
    image?: any;
    maxWidth?: any;
    maxHeight?: any;
    className?: string;
    disabled?: boolean;
    style?: any;
};

const ImageDropZone: React.FC<ImageDropZoneProps> = ({
    disabled = undefined,
    image = undefined,
    onImage,
    maxWidth = undefined,
    maxHeight = undefined,
    className: labelClassName = undefined,
    ...props
}) => {
    const classes = useStyles({ maxWidth, maxHeight });
    const [value, setValue] = React.useState([]);
    const inputId = React.useMemo(() => `image-drop-zone-${next()}`, []);

    if (disabled) {
        return (
            <label {...props} className={labelClassName}>
                <NoPhotoIcon color="disabled" className={classes.icon} />
            </label>
        );
    }

    const sendOffFirstFile = (files: FileList) => {
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.type.indexOf("image/") !== 0) continue;
            onImage(f);
            setValue([]);
            break;
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        const dt = event.dataTransfer;
        const files = dt.files;
        sendOffFirstFile(files);
    };

    const handleFileSelect = (event) => {
        sendOffFirstFile(event.target.files);
    };

    return (
        <label
            title="Drag and drop an image, or click to select one."
            {...props}
            className={clsx(labelClassName, classes.label)}
            htmlFor={inputId}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {image ? (
                <ImageOrPreview
                    src={image}
                    alt={""}
                    className={classes.preview}
                />
            ) : (
                <AddPhotoIcon color="disabled" className={classes.icon} />
            )}
            <input
                id={inputId}
                accept="image/*"
                type="file"
                className={classes.input}
                value={value}
                onChange={handleFileSelect}
            />
        </label>
    );
};

export default ImageDropZone;
