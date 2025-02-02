import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import { BfsId } from "@/global/types/identity";

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
    width?: number;
    height?: number;
}

const TextractApi = {
    promiseJobList: () =>
        axios.get(`/`).then((d): PendingJob[] =>
            d.data.map(
                (job) =>
                    ({
                        id: job.id,
                        url: job.photo.url,
                        name: job.photo.filename,
                        ready: job.ready,
                    }) as PendingJob,
            ),
        ),
    promiseJob: (id: BfsId) =>
        axios.get(`/${id}`).then(
            (data) =>
                ({
                    image: data.data.photo.url,
                    textract: data.data.lines || [],
                }) as Job,
        ),
    promiseNewJob: (photo) => {
        const payload = new FormData();
        payload.append("photo", photo);
        return axios.post(`/`, payload);
    },
    promiseJobDelete: (id: BfsId) => axios.delete(`/${id}`),
};

export default TextractApi;
