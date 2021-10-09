import PropTypes from "prop-types";
import React, {
    createContext,
    useContext,
    useMemo,
} from "react";
import { COOKIE_AUTH_TOKEN } from "../../constants";
import { getCookie } from "../../util/cookies";

const TokenContext = createContext(true);

export function TokenProvider({children}) {
    const token = useMemo(getCookie.bind(undefined, COOKIE_AUTH_TOKEN), []);
    return <TokenContext.Provider value={token}>
        {children}
    </TokenContext.Provider>;
}

TokenProvider.propTypes = {
    children: PropTypes.node,
};

export const useToken = () =>
    useContext(TokenContext);

