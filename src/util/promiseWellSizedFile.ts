import { MAX_UPLOAD_BYTES } from "@/constants";

function get2dContextFromCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context was found for canvas");
    return ctx;
}

const promiseWellSizedFile = (fileOrString: File | string) =>
    new Promise<File | string>((resolve, reject) => {
        if (
            fileOrString instanceof File &&
            fileOrString.size >= MAX_UPLOAD_BYTES
        ) {
            // lifted from https://codepen.io/tuanitpro/pen/wJZJbp
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = function (e) {
                if (!e.target || !e.target.result) return;
                const img = document.createElement("img");
                img.onerror = reject;
                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    let ctx = get2dContextFromCanvas(canvas);
                    ctx.drawImage(img, 0, 0);

                    // Scale by total area, maintaining aspect ratio, aiming a
                    // little low. PNG will be way over-reduced, but whatever. WebP
                    // is around a third smaller than JPEG, so have to reduce it
                    // even further, so it'll still fit when reencoded.
                    const baseFactor =
                        fileOrString.type === "image/webp" ? 0.6 : 0.8;
                    const factor =
                        (MAX_UPLOAD_BYTES / fileOrString.size) * baseFactor;
                    const srcArea = img.width * img.height;
                    const targetArea = Math.floor(srcArea * factor);
                    const width = Math.floor(
                        Math.sqrt((targetArea * img.width) / img.height),
                    );
                    const height = Math.floor(
                        Math.sqrt((targetArea * img.height) / img.width),
                    );

                    canvas.width = width;
                    canvas.height = height;
                    ctx = get2dContextFromCanvas(canvas);
                    ctx.drawImage(img, 0, 0, width, height);

                    const contentType = "image/jpeg";
                    canvas.toBlob((blob) => {
                        if (!blob)
                            throw new Error("Failed to create JPG from canvas");
                        let fn = fileOrString.name;
                        if (!fn.endsWith(".jpg")) {
                            fn += ".jpg";
                        }
                        const file = new File([blob], fn, {
                            type: contentType,
                        });
                        // eslint-disable-next-line no-console
                        console.log(
                            "Resized file from %s to %s bytes (cap: %s)",
                            fileOrString.size,
                            file.size,
                            MAX_UPLOAD_BYTES,
                        );
                        resolve(
                            file.size >= MAX_UPLOAD_BYTES
                                ? promiseWellSizedFile(file)
                                : file,
                        );
                    }, contentType);
                };
                // readAsDataURL assures us result is a string
                img.src = e.target.result as string;
            };
            reader.readAsDataURL(fileOrString);
        } else {
            resolve(fileOrString);
        }
    });

export default promiseWellSizedFile;
