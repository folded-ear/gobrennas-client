import PropTypes from "prop-types";
import React, {
    createContext,
    useContext,
    useMemo,
} from "react";
import { COOKIE_AUTH_TOKEN } from "../constants";
import { getCookie } from "util/cookies";

const AuthTokenContext = createContext(true);

export function AuthTokenProvider({children}) {
    const token = useMemo(getCookie.bind(undefined, COOKIE_AUTH_TOKEN), []);
    return <AuthTokenContext.Provider value={token}>
        {children}
    </AuthTokenContext.Provider>;
}

AuthTokenProvider.propTypes = {
    children: PropTypes.node,
};

export const useAuthToken = () =>
    useContext(AuthTokenContext);

