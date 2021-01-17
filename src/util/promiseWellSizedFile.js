import { MAX_UPLOAD_BYTES } from "../constants";

const promiseWellSizedFile = fileOrString => new Promise((resolve, reject) => {
    if (fileOrString instanceof File && fileOrString.size > MAX_UPLOAD_BYTES) {
        // lifted from https://codepen.io/tuanitpro/pen/wJZJbp
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = function (e) {
            const img = document.createElement("img");
            img.onerror = reject;
            img.onload = function() {
                const canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                // Scale by total area, maintaining aspect ratio, aiming a
                // little low. If it's a PNG source, the JPG will end up _way_
                // smaller, but whatever.
                const factor = MAX_UPLOAD_BYTES / fileOrString.size * 0.9;
                const srcArea = img.width * img.height;
                const targetArea = Math.floor(srcArea * factor);
                const width = Math.floor(Math.sqrt(targetArea * img.width / img.height));
                const height = Math.floor(Math.sqrt(targetArea * img.height / img.width));

                canvas.width = width;
                canvas.height = height;
                ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const contentType = "image/jpeg";
                canvas.toBlob(blob => {
                    let fn = fileOrString.name;
                    if (!fn.endsWith(".jpg")) {
                        fn += ".jpg";
                    }
                    resolve(new File([blob], fn, { type: contentType}));
                }, contentType);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileOrString);
    } else {
        resolve(fileOrString);
    }
});

export default promiseWellSizedFile;
