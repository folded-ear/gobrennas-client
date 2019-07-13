import { ReduceStore } from "flux/utils"
import Dispatcher from "./dispatcher"
import LoadObject from "../util/LoadObject"
import hotLoadObject from "../util/hotLoadObject"
import FriendActions from "./FriendActions"
import BaseAxios from "axios"
import { API_BASE_URL } from "../constants/index"
import promiseFlux from "../util/promiseFlux"

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/friends`,
})

class FriendStore extends ReduceStore {
    constructor() {
        super(Dispatcher)
    }

    getInitialState() {
        return LoadObject.empty()
    }

    reduce(state, action) {
        switch (action.type) {

            case FriendActions.LOAD_FRIEND_LIST: {
                promiseFlux(
                    axios.get(``),
                    data => ({
                        type: FriendActions.FRIEND_LIST_LOADED,
                        data: data.data,
                    }),
                )
                return state.loading()
            }

            case FriendActions.FRIEND_LIST_LOADED: {
                return state.setValue(action.data).done()
            }

            default:
                return state
        }
    }

    getFriendsLO() {
        return hotLoadObject(
            () => this.getState(),
            () => Dispatcher.dispatch({
                type: FriendActions.LOAD_FRIEND_LIST,
            }),
        )
    }

}

export default new FriendStore()