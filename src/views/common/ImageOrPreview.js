import PropTypes from "prop-types";
import React from "react";

/**
 * I am an HTML `img` tag, with the additional feature of automatically creating
 * (and revoking, of course) an object URL if the passed `src` prop isn't a
 * String. If the `src` prop is a String, I do nothing special. All additional
 * props are passed through directly to the `img` tag.
 *
 * @param src Either a String containing the URL of the image, or a Blob/File to
 *  preview as an image
 * @param props Additional properties to set directly on the `img` itself.
 */
const ImageOrPreview = ({src, ...props}) => {
    const [srcUrl, setSrcUrl] = React.useState(
        typeof src === "string" ? src : null
    );
    React.useEffect(() => {
        if (typeof src !== "string") {
            const url = URL.createObjectURL(src);
            setSrcUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [src]);
    // noinspection HtmlRequiredAltAttribute
    return <img src={srcUrl} {...props} />; // eslint-disable-line jsx-a11y/alt-text
};

ImageOrPreview.propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.string, // actual URL
        PropTypes.object, // a Blob (including File)
    ]).isRequired
};

export default ImageOrPreview;
