import { gql } from "@/__generated__";
import { client } from "@/providers/ApolloClient";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";

const GET_SCRATCH_UPLOAD = gql(`
query getScratchUpload($contentType: String!, $filename: String!) {
  profile {
    scratchFile(
      contentType: $contentType
      originalFilename: $filename
    ) {
      url
      cacheControl
      filename
    }
  }
}`);

async function promiseScratchUpload(toUpload: File, resize = true) {
    // resize, if requested
    if (resize) toUpload = await promiseWellSizedFile(toUpload);
    // get a presigned URL
    const { data } = await client.query({
        query: GET_SCRATCH_UPLOAD,
        variables: {
            contentType: toUpload.type,
            filename: toUpload.name,
        },
    });
    const { url, filename, cacheControl } = data!.profile.scratchFile;
    // upload it
    await fetch(url, {
        method: "PUT",
        headers: {
            "Cache-Control": cacheControl,
        },
        body: toUpload,
    });
    // return the identifying filename of the upload
    return filename;
}

export default promiseScratchUpload;
