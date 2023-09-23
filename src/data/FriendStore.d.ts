import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "../util/LoadObject";
import {
  BfsId,
  FluxAction,
  UserType
} from "../global/types/types";
import { State } from "@dnd-kit/core/dist/store";

declare namespace FriendStore {}

declare class FriendStore extends FluxReduceStore<State, FluxAction> {
    getFriendsLO(): LoadObject<UserType[]>;

    getFriendLO(id: BfsId): LoadObject<UserType>;
}

const friendStore: FriendStore;
export = friendStore;
