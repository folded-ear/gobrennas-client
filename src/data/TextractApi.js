import BaseAxios from "axios";
import { API_BASE_URL } from "../constants/index";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/textract`,
});

const TextractApi = {
    promiseJobList: () => axios.get(`/`),
    promiseJob: id => axios.get(`/${id}`),
    promiseNewJob: photo => {
        let payload = new FormData();
        payload.append("photo", photo);
        return axios.post(`/`, payload);
    },
    promiseJobDelete: id => axios.delete(`/${id}`),
};

export default TextractApi;
