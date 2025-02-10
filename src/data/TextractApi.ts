import { CREATE_TEXTRACT_JOB, DELETE_TEXTRACT_JOB } from "@/data/mutations";
import { LIST_TEXTRACT_JOBS, LOAD_TEXTRACT_JOB } from "@/data/queries";
import { BfsId, ensureString } from "@/global/types/identity";
import { client } from "@/providers/ApolloClient";

export interface PendingJob {
    id: string;
    url: string;
    name: string;
    ready: boolean;
}

export interface Job {
    image: string;
    textract: Line[];
}

export interface Line {
    text: string;
    box: BoundingBox;
}

export interface BoundingBox {
    top: number;
    left: number;
    width: number;
    height: number;
}

const TextractApi = {
    promiseJobList: (): Promise<PendingJob[]> =>
        client
            .query({ query: LIST_TEXTRACT_JOBS, fetchPolicy: "no-cache" })
            .then(
                ({ data }) =>
                    data?.textract.listJobs.map((job) => ({
                        id: job.id,
                        url: job.photo.url,
                        name: job.photo.filename,
                        ready: job.ready,
                    })),
            ),
    promiseJob: (id: BfsId): Promise<Job> =>
        client
            .query({
                query: LOAD_TEXTRACT_JOB,
                variables: { id: ensureString(id) },
                fetchPolicy: "no-cache",
            })
            .then(({ data }) => {
                const job = data!.textract.jobById;
                return {
                    image: job.photo.url,
                    textract: job.lines ?? [],
                };
            }),
    promiseNewJob: (photo: File) =>
        client.mutate({
            mutation: CREATE_TEXTRACT_JOB,
            variables: { photo },
        }),
    promiseJobDelete: (id: BfsId) =>
        client.mutate({
            mutation: DELETE_TEXTRACT_JOB,
            variables: { id: ensureString(id) },
        }),
};

export default TextractApi;
