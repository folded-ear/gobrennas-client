import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import { BfsId, ensureString } from "@/global/types/identity";
import { client } from "@/providers/ApolloClient";
import { LIST_TEXTRACT_JOBS, LOAD_TEXTRACT_JOB } from "@/data/queries";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/textract`,
});

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
        client.query({ query: LIST_TEXTRACT_JOBS }).then(
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
            })
            .then(({ data }) => {
                const job = data!.textract.jobById;
                return {
                    image: job.photo.url,
                    textract: job.lines ?? [],
                };
            }),
    promiseNewJob: (photo) => {
        const payload = new FormData();
        payload.append("photo", photo);
        return axios.post(`/`, payload);
    },
    promiseJobDelete: (id: BfsId) => axios.delete(`/${id}`),
};

export default TextractApi;
