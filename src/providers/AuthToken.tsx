import { COOKIE_AUTH_TOKEN } from "@/constants";
import { getCookie } from "@/util/cookies";
import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
} from "react";

const AuthTokenContext = createContext("");

type Props = PropsWithChildren<unknown>;

export const AuthTokenProvider: React.FC<Props> = ({ children }) => {
    const token = useMemo(() => getCookie(COOKIE_AUTH_TOKEN), []);
    return (
        <AuthTokenContext.Provider value={token}>
            {children}
        </AuthTokenContext.Provider>
    );
};

export const useAuthToken = () => useContext(AuthTokenContext);
