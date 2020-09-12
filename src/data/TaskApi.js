import BaseAxios from "axios";
import { API_BASE_URL } from "../constants/index";
import promiseFlux from "../util/promiseFlux";
import serializeObjectOfPromiseFns from "../util/serializeObjectOfPromiseFns";
import TaskActions from "./TaskActions";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/tasks`,
});

const TaskApi = {

    createList: (name, clientId) =>
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
        ),

    loadLists: () =>
        promiseFlux(
            axios.get(`/`),
            ({data}) => ({
                type: TaskActions.LISTS_LOADED,
                data,
            }),
        ),

    loadSubtasks: (id, background = false) =>
        promiseFlux(
            axios.get(`/${id}/subtasks`),
            ({data}) => ({
                type: TaskActions.SUBTASKS_LOADED,
                id,
                data,
                background,
            }),
        ),

    createTask: (name, parentId, clientId) =>
        promiseFlux(
            axios.post(`/${parentId}/subtasks`, {
                name,
            }),
            ({data}) => ({
                type: TaskActions.TASK_CREATED,
                clientId,
                id: data.id,
                data,
            }),
        ),

    renameTask: (id, name) =>
        promiseFlux(
            axios.put(`/${id}/name`, {
                name,
            }),
            ({data}) => ({
                type: TaskActions.TASK_RENAMED,
                id,
                data,
            }),
        ),

    deleteList: (id) =>
        promiseFlux(
            axios.delete(`/${id}`),
            () => ({
                type: TaskActions.LIST_DELETED,
                id,
            }),
        ),

    completeTask: (id) =>
        promiseFlux(
            axios.put(`/${id}/complete`, {
                complete: true,
            }),
            () => ({
                type: TaskActions.TASK_COMPLETED,
                id,
            }),
        ),

    deleteTask: (id) =>
        promiseFlux(
            axios.delete(`/${id}`),
            () => ({
                type: TaskActions.TASK_DELETED,
                id,
            }),
        ),

    resetSubtasks: (id, subtaskIds) =>
        promiseFlux(
            axios.put(`/${id}/subtaskIds`, {
                subtaskIds
            }),
            () => ({
                type: TaskActions.SUBTASKS_RESET,
                id,
            })
        ),

    resetParent: (id, parentId) =>
        promiseFlux(
            axios.put(`/${id}/parentId`, {
                parentId,
            }),
            () => ({
                type: TaskActions.PARENT_RESET,
                id,
            })
        ),

    setListGrant: (id, userId, level) =>
        // i was not thinking when i designed this endpoint. :)
        promiseFlux(
            axios.post(`/${id}/acl/grants`, {
                userId,
                accessLevel: level,
            }),
            () => ({
                type: TaskActions.LIST_GRANT_SET,
                id,
                userId,
            })
        ),

    clearListGrant: (id, userId) =>
        promiseFlux(
            axios.delete(`/${id}/acl/grants/${userId}`),
            () => ({
                type: TaskActions.LIST_GRANT_CLEARED,
                id,
                userId,
            })
        ),

};

export default serializeObjectOfPromiseFns(TaskApi);