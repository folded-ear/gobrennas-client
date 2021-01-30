import useFluxStore from "./useFluxStore";
import UserStore from "./UserStore";

const useProfileLO = () => useFluxStore(
    () => UserStore.getProfileLO(),
    [UserStore],
);

export default useProfileLO;
