import { BfsId, UserType } from "@/global/types/identity";
import { RippedLO } from "@/util/ripLoadObject";
import FriendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";

function useFriendRlo(id: BfsId): RippedLO<UserType> {
    return useFluxStore(
        () => FriendStore.getFriendRlo(id),
        [FriendStore],
        [id],
    );
}

export default useFriendRlo;
