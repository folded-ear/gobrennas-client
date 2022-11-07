import BaseAxios from "axios";
import { API_BASE_URL } from "../constants/index";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

const ItemApi = {

    recognizeItem(raw, cursor = raw.length) {
        return axios.post(`/item/recognize`, {
            raw,
            cursor,
        })
            .then(r => r.data);
    },

};

export default ItemApi;
