import { BfsId, UserType } from "@/global/types/identity";
import { client } from "@/providers/ApolloClient";
import LoadObjectState from "@/util/LoadObjectState";
import promiseFlux from "@/util/promiseFlux";
import { mapData, ripLoadObject, RippedLO } from "@/util/ripLoadObject";
import { gql } from "@/__generated__";
import { ReduceStore } from "flux/utils";
import dispatcher, { ActionType, FluxAction } from "./dispatcher";

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

type State = LoadObjectState<UserType[]>;

class FriendStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return new LoadObjectState<UserType[]>(() =>
            this.__dispatcher.dispatch({
                type: ActionType.FRIEND__LOAD_FRIEND_LIST,
            }),
        );
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.FRIEND__LOAD_FRIEND_LIST: {
                promiseFlux(
                    client.query({ query: GET_FRIENDS }),
                    ({ data }) => ({
                        type: ActionType.FRIEND__FRIEND_LIST_LOADED,
                        data: data.profile.friends,
                    }),
                );
                return state.mapLO((lo) => lo.loading());
            }

            case ActionType.FRIEND__FRIEND_LIST_LOADED: {
                return state.mapLO((lo) => lo.setValue(action.data).done());
            }

            default:
                return state;
        }
    }

    getFriendsRlo(): RippedLO<UserType[]> {
        return ripLoadObject(this.getState().getLoadObject());
    }

    getFriendRlo(id: BfsId): RippedLO<UserType> {
        return mapData(this.getFriendsRlo(), (fs) =>
            fs.find((f) => f.id === id),
        );
    }
}

export default new FriendStore(dispatcher);
