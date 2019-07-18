import BaseAxios from "axios"
import { API_BASE_URL } from "../constants"
import LibraryActions from "./LibraryActions"
import promiseFlux from "../util/promiseFlux"

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
})

const LibraryApi = {
    
    loadLibrary: () => {
        promiseFlux(
            axios.get(`/`),
            data => ({
                type: LibraryActions.LIBRARY_LOADED,
                data: data.data,
            }),
        )
    },

    getIngredient(id) {
        promiseFlux(
            axios.get(`/or-ingredient/${id}`),
            data => ({
                type: LibraryActions.INGREDIENT_LOADED,
                id,
                data: data.data,
            })
        )
    },
}

export default LibraryApi