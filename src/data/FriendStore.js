import { ReduceStore } from "flux/utils";
import LoadObjectState from "@/util/LoadObjectState";
import promiseFlux from "@/util/promiseFlux";
import Dispatcher from "./dispatcher";
import FriendActions from "./FriendActions";
import { mapData, ripLoadObject } from "@/util/ripLoadObject";
import { bfsIdEq } from "@/global/types/identity";
import { client } from "@/providers/ApolloClient";
import { gql } from "@/__generated__";

const GET_FRIENDS = gql(`
query getFriends {
  profile {
    friends {
      id
      name
      provider
      email
      imageUrl
      roles
    }
  }
}`);

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
                promiseFlux(
                    client.query({ query: GET_FRIENDS }),
                    ({ data }) => {
                        return {
                            type: FriendActions.FRIEND_LIST_LOADED,
                            data: data.profile.friends,
                        };
                    },
                );
                return state.mapLO((lo) => lo.loading());
            }

            case FriendActions.FRIEND_LIST_LOADED: {
                return state.mapLO((lo) => lo.setValue(action.data).done());
            }

            default:
                return state;
        }
    }

    getFriendsRlo() {
        return ripLoadObject(this.getState().getLoadObject());
    }

    getFriendRlo(id) {
        return mapData(this.getFriendsRlo(), (fs) =>
            fs.find((f) => bfsIdEq(f.id, id)),
        );
    }
}

export default new FriendStore();
