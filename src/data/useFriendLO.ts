import FriendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";

function useFriendLO(id: string | number) {
    return useFluxStore(
        () => FriendStore.getFriendLO(id),
        [ FriendStore ],
        [ id ],
    );
}

export default useFriendLO;
