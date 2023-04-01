import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
} from "react";
import { COOKIE_AUTH_TOKEN } from "../constants";
import { getCookie } from "util/cookies";

const AuthTokenContext = createContext(true);

export const AuthTokenProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const token = useMemo(
        () => getCookie(COOKIE_AUTH_TOKEN),
        [],
    );
    return <AuthTokenContext.Provider value={token}>
        {children}
    </AuthTokenContext.Provider>;
};

export const useAuthToken = () =>
    useContext(AuthTokenContext);
