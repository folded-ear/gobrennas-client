import FriendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";
import { BfsId } from "@/global/types/identity";

function useFriendRlo(id: BfsId) {
    return useFluxStore(
        () => FriendStore.getFriendRlo(id),
        [FriendStore],
        [id],
    );
}

export default useFriendRlo;
