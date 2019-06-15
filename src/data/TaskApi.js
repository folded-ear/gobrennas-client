import BaseAxios from "axios";
import promiseFlux from "../util/promiseFlux";
import TaskActions from "./TaskActions";
import { API_BASE_URL } from "../constants/index";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/tasks`,
});

const TaskApi = {

    createList(name, clientId) {
        promiseFlux(
            axios.post(`/`, {
                name,
            }),
            data => ({
                type: TaskActions.LIST_CREATED,
                clientId,
                id: data.data.id,
                data: data.data,
            }),
        );
    },

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

    createTask(name, parentId, clientId) {
        promiseFlux(
            axios.post(`/${parentId}/subtasks`, {
                name,
            }),
            ({data}) => ({
                type: TaskActions.TASK_CREATED,
                clientId,
                id: data.id,
                data: data
            }),
        );
    },

    renameTask(id, name) {
        promiseFlux(
            axios.put(`/${id}/name`, {
                name,
            }),
            () => ({
                type: TaskActions.TASK_RENAMED,
                id,
                name,
            }),
        )
    },

    deleteTask(id) {
        promiseFlux(
            axios.delete(`/${id}`),
            () => ({
                type: TaskActions.TASK_DELETED,
                id,
            }),
        );
    },

    resetSubtasks(id, subtaskIds) {
        promiseFlux(
            axios.put(`/${id}/subtaskIds`, {
                subtaskIds
            }),
            () => ({
                type: TaskActions.SUBTASKS_RESET,
                id,
            })
        );
    },
};

export default TaskApi;