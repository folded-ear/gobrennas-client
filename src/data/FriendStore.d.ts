import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "../util/LoadObject";
import {
    FluxAction,
    UserType,
} from "../global/types/types";

declare namespace FriendStore {
}

declare class FriendStore extends FluxReduceStore<State, FluxAction> {
    getFriendsLO(): LoadObject<UserType[]>

    getFriendLO(id: number | string): LoadObject<UserType>
}

const friendStore: FriendStore;
export = friendStore;
