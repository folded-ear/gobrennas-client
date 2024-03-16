import FriendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";
import { BfsId } from "global/types/identity";

function useFriendLO(id: BfsId) {
    return useFluxStore(() => FriendStore.getFriendLO(id), [FriendStore], [id]);
}

export default useFriendLO;
