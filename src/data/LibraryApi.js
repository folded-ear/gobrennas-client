import BaseAxios from "axios";
import {API_BASE_URL} from "../constants";
import LibraryActions from "./LibraryActions";
import promiseFlux from "../util/promiseFlux";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const LibraryApi = {
    
    loadLibrary: () => {
        promiseFlux(
            axios.get(`/all`),
            data => ({
                type: LibraryActions.LIBRARY_LOADED,
                data: data.data,
            }),
        );
    }
    
};

export default LibraryApi