import { ReduceStore } from "flux/utils";
import LoadObjectState from "@/util/LoadObjectState";
import promiseFlux from "@/util/promiseFlux";
import dispatcher, { FluxAction } from "./dispatcher";
import { mapData, ripLoadObject, RippedLO } from "@/util/ripLoadObject";
import { BfsId, bfsIdEq, UserType } from "@/global/types/identity";
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

type State = LoadObjectState<UserType[]>;

class FriendStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return new LoadObjectState<UserType[]>(() =>
            this.__dispatcher.dispatch({
                type: "friend/load-friend-list",
            }),
        );
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case "friend/load-friend-list": {
                promiseFlux(
                    client.query({ query: GET_FRIENDS }),
                    ({ data }) => ({
                        type: "friend/friend-list-loaded",
                        data: data.profile.friends,
                    }),
                );
                return state.mapLO((lo) => lo.loading());
            }

            case "friend/friend-list-loaded": {
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
            fs.find((f) => bfsIdEq(f.id, id)),
        );
    }
}

export default new FriendStore(dispatcher);
