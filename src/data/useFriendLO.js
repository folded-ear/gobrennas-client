import FriendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";

const useFriendLO = id => useFluxStore(
    () => FriendStore.getFriendLO(id),
    [FriendStore],
    [id],
);

export default useFriendLO;
