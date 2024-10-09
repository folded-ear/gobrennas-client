import BaseAxios from "axios";
import { ReduceStore } from "flux/utils";
import LoadObjectState from "@/util/LoadObjectState";
import promiseFlux from "@/util/promiseFlux";
import { API_BASE_URL } from "@/constants";
import Dispatcher from "./dispatcher";
import FriendActions from "./FriendActions";
import { mapData, ripLoadObject } from "@/util/ripLoadObject";
import { bfsIdEq } from "@/global/types/identity";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/friends`,
});

class FriendStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return new LoadObjectState(() =>
            Dispatcher.dispatch({
                type: FriendActions.LOAD_FRIEND_LIST,
            }),
        );
    }

    reduce(state, action) {
        switch (action.type) {
            case FriendActions.LOAD_FRIEND_LIST: {
                promiseFlux(axios.get(``), (data) => ({
                    type: FriendActions.FRIEND_LIST_LOADED,
                    data: data.data,
                }));
                return state.mapLO((lo) => lo.loading());
            }

            case FriendActions.FRIEND_LIST_LOADED: {
                return state.mapLO((lo) =>
                    lo
                        .setValue(
                            action.data.map((f) => ({
                                ...f,
                                id_s: "" + f.id,
                            })),
                        )
                        .done(),
                );
            }

            default:
                return state;
        }
    }

    getFriendsRlo() {
        return ripLoadObject(this.getState().getLoadObject());
    }

    getFriendRlo(id) {
        const id_s = "" + id;
        return mapData(this.getFriendsRlo(), (fs) =>
            fs.find((f) => bfsIdEq(f.id_s, id_s)),
        );
    }
}

export default new FriendStore();
