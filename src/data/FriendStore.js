import BaseAxios from "axios";
import { ReduceStore } from "flux/utils";
import { API_BASE_URL } from "../constants/index";
import hotLoadObject from "../util/hotLoadObject";
import LoadObject from "../util/LoadObject";
import promiseFlux from "../util/promiseFlux";
import Dispatcher from "./dispatcher";
import FriendActions from "./FriendActions";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/friends`,
});

class FriendStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return LoadObject.empty();
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
                );
                return state.loading();
            }

            case FriendActions.FRIEND_LIST_LOADED: {
                return state.setValue(action.data).done();
            }

            default:
                return state;
        }
    }

    getFriendsLO() {
        return hotLoadObject(
            () => this.getState(),
            () => Dispatcher.dispatch({
                type: FriendActions.LOAD_FRIEND_LIST,
            }),
        );
    }

    getFriendLO(id) {
        return this.getFriendsLO()
            .map(fs => fs.find(f => f.id === id));
    }

}

export default new FriendStore();