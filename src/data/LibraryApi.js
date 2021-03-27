import BaseAxios from "axios";
import qs from "qs";
import { API_BASE_URL } from "../constants";
import promiseFlux from "../util/promiseFlux";
import socket from "../util/socket";
import LibraryActions from "./LibraryActions";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

export const PAGE_SIZE = 9; // multiple of three; around a window's worth.

const LibraryApi = {
    
    searchLibrary: (scope, filter, page=0) => {
        const params = {
            scope,
            filter: filter.trim(),
            page,
            pageSize: PAGE_SIZE,
        };
        promiseFlux(
            axios.get(`/?${qs.stringify(params)}`),
            data => ({
                type: LibraryActions.SEARCH_LOADED,
                data: data.data,
                scope,
                filter,
            }),
        );
    },

    getIngredient(id) {
        promiseFlux(
            axios.get(`/or-ingredient/${id}`),
            data => ({
                type: LibraryActions.INGREDIENT_LOADED,
                id,
                data: data.data,
            })
        );
    },

    getIngredientInBulk(ids) {
        promiseFlux(
            axios.get(`/bulk-ingredients/${ids}`),
            data => ({
                type: LibraryActions.INGREDIENTS_LOADED,
                ids,
                data: data.data,
            })
        );
    },

    orderForStore(id, targetId, after) {
        socket.publish("/api/pantry-item/order-for-store", {
            id,
            targetId,
            after: !!after,
        });
    },

};

export default LibraryApi;
