import BaseAxios from "axios";
import promiseFlux from "../util/promiseFlux";
import TaskActions from "./TaskActions";

const axios = BaseAxios.create({
    baseURL: "/api/tasks",
});

const TaskApi = {

    loadLists() {
        promiseFlux(
            axios.get(`/`),
            data => ({
                type: TaskActions.LISTS_LOADED,
                data: data.data,
            }),
        );
    },

    loadSubtasks(id) {
        promiseFlux(
            axios.get(`/${id}/subtasks`),
            data => ({
                type: TaskActions.SUBTASKS_LOADED,
                id,
                data: data.data,
            }),
        )
    },

};

export default TaskApi;