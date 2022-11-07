import BaseAxios from "axios";
import { ReduceStore } from "flux/utils";
import { API_BASE_URL } from "../constants/index";
import LoadObjectState from "util/LoadObjectState";
import promiseFlux from "util/promiseFlux";
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
                return state.mapLO(lo => lo.setValue(action.data).done());
            }

            default:
                return state;
        }
    }

    getFriendsLO() {
        return this.getState().getLoadObject();
    }

    getFriendLO(id) {
        return this.getFriendsLO()
            .map(fs => fs.find(f => f.id === id));
    }

}

export default new FriendStore();