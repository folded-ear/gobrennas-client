import BaseAxios from "axios";
import { API_BASE_URL } from "../../../constants/index";
import promiseFlux from "../../../util/promiseFlux";
import TaskActions from "./TaskActions";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/plan`,
});

const PlanApi = {

    getDescendantsAsList: id =>
        promiseFlux(
            axios.get(`/${id}/descendants`),
            r => ({
                type: TaskActions.LIST_DATA_BOOTSTRAPPED,
                id,
                data: r.data,
            }),
        ),

    getItemsUpdatedSince: (id, cutoff) =>
        axios.get(`/${id}/all-since?cutoff=${cutoff}`),

};

export default PlanApi;
