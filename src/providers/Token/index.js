import PropTypes from "prop-types";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { COOKIE_AUTH_TOKEN } from "../../constants";
import { getCookie } from "../../util/cookies";

const TokenContext = createContext(true);

export function TokenProvider({children}) {
    const [token, setToken] = useState(undefined);
    useEffect(() => {
        const token = getCookie(COOKIE_AUTH_TOKEN);
        if (token) setToken(token);
    }, []);
    return <TokenContext.Provider value={token}>
        {children}
    </TokenContext.Provider>;
}

TokenProvider.propTypes = {
    children: PropTypes.node,
};

export const useToken = () =>
    useContext(TokenContext);

