import BaseAxios from "axios";
import { ReduceStore } from "flux/utils";
import LoadObjectState from "util/LoadObjectState";
import promiseFlux from "util/promiseFlux";
import { API_BASE_URL } from "../constants/index";
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
        return new LoadObjectState(
            () => Dispatcher.dispatch({
                type: FriendActions.LOAD_FRIEND_LIST,
            }));
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
                return state.mapLO(lo => lo.loading());
            }

            case FriendActions.FRIEND_LIST_LOADED: {
                return state.mapLO(lo => lo.setValue(action.data
                    .map(f => ({
                        ...f,
                        id_s: "" + f.id,
                    }))).done());
            }

            default:
                return state;
        }
    }

    getFriendsLO() {
        return this.getState().getLoadObject();
    }

    getFriendLO(id) {
        const id_s = "" + id;
        return this.getFriendsLO()
            .map(fs => fs.find(f => f.id_s === id_s));
    }

}

export default new FriendStore();
