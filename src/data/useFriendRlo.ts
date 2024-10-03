import FriendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";
import { BfsId, UserType } from "@/global/types/identity";
import { RippedLO } from "@/util/ripLoadObject";

function useFriendRlo(id: BfsId): RippedLO<UserType> {
    return useFluxStore(
        () => FriendStore.getFriendRlo(id),
        [FriendStore],
        [id],
    );
}

export default useFriendRlo;
