import useFluxStore from "./useFluxStore";
import UserStore from "./UserStore";

const useIsAuthenticated = () => useFluxStore(
    () => UserStore.isAuthenticated(),
    [UserStore],
);

export default useIsAuthenticated;
