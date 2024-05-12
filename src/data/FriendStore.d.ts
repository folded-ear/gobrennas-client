import FluxReduceStore from "flux/lib/FluxReduceStore";
import { BfsId, FluxAction, UserType } from "../global/types/types";
import { State } from "@dnd-kit/core/dist/store";
import { RippedLO } from "../util/ripLoadObject";

declare namespace FriendStore {}

declare class FriendStore extends FluxReduceStore<State, FluxAction> {
    getFriendsRlo(): RippedLO<UserType[]>;

    getFriendRlo(id: BfsId): RippedLO<UserType>;
}

const friendStore: FriendStore;
export = friendStore;
