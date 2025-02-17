import ClientId from "@/util/ClientId";
import { AddPhotoIcon, NoPhotoIcon } from "@/views/common/icons";
import ImageOrPreview from "@/views/common/ImageOrPreview";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import * as React from "react";

const useStyles = makeStyles((theme) => ({
    label: ({ notOnPaper }: StyleProps) => ({
        textAlign: "center",
        backgroundColor: notOnPaper
            ? theme.palette.neutral.main
            : theme.palette.background.default,
    }),
    active: {
        cursor: "pointer",
    },
    preview: ({ maxWidth, maxHeight }: StyleProps) => ({
        maxWidth: maxWidth || "400px",
        maxHeight: maxHeight || "200px",
    }),
    icon: {
        margin: "30px 40px",
    },
    input: {
        opacity: 0,
        height: 0,
        width: 0,
    },
}));

interface ImageDropZoneProps {
    onImage(f: File): void;
    image?: string | Blob;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
    className?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    notOnPaper?: boolean;
}

type StyleProps = Pick<
    ImageDropZoneProps,
    "maxWidth" | "maxHeight" | "notOnPaper"
>;

const ImageDropZone = ({
    disabled = undefined,
    image = undefined,
    onImage,
    maxWidth = undefined,
    maxHeight = undefined,
    className: labelClassName = undefined,
    notOnPaper,
    ...props
}: ImageDropZoneProps) => {
    const classes = useStyles({ notOnPaper, maxWidth, maxHeight });
    const [value, setValue] = React.useState([]);
    const inputId = React.useMemo(() => `drop-zone-${ClientId.next()}`, []);

    if (disabled) {
        return (
            <label {...props} className={clsx(labelClassName, classes.label)}>
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

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const dt = event.dataTransfer;
        const files = dt.files;
        sendOffFirstFile(files);
    };

    const handleFileSelect = (event: React.ChangeEvent) => {
        const { files } = event.target as HTMLInputElement;
        files && sendOffFirstFile(files);
    };

    return (
        <label
            title="Drag and drop an image, or click to select one."
            {...props}
            className={clsx(labelClassName, classes.label, classes.active)}
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
