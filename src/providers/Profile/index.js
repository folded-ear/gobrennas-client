import BaseAxios from "axios";
import PropTypes from "prop-types";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    API_BASE_URL,
    LOCAL_STORAGE_ACCESS_TOKEN,
} from "../../constants";
import GTag from "../../GTag";
import LoadObject from "../../util/LoadObject";
import { useToken } from "../Token";

// global side effect to ensure cookies are passed
BaseAxios.defaults.withCredentials = true;

const axios = BaseAxios.create({
    baseURL: API_BASE_URL,
});

const ProfileLOContext = createContext(undefined);

export function ProfileProvider({children}) {
    const token = useToken();
    const [profileLO, setProfileLO] = useState(LoadObject.empty());
    useEffect(() => {
        if (!token) return;
        if (profileLO.hasValue()) return;
        if (!profileLO.isDone()) return;
        axios.get("/api/user/me")
            .then(data => {
                GTag("set", {
                    uid: data.data.id,
                });
                setProfileLO(lo =>
                    lo.setValue(data.data).done());
            })
            .catch(error => {
                setProfileLO(lo =>
                    lo.setError(error).done());
            });
        setProfileLO(lo =>
            lo.loading());
    }, [token, profileLO]);
    return <ProfileLOContext.Provider value={profileLO}>
        {children}
    </ProfileLOContext.Provider>;
}

ProfileProvider.propTypes = {
    children: PropTypes.node,
};

export const useProfileLO = () =>
    useContext(ProfileLOContext);

export const useIsAuthenticated = () =>
    useProfileLO().hasValue();

export const useIsDeveloper = () => {
    const lo = useProfileLO();
    if (!lo.hasValue()) return false;
    if (!lo.isDone()) return false; // in-flight means "gotta wait"
    const profile = lo.getValueEnforcing();
    return profile.roles && profile.roles.indexOf("DEVELOPER") >= 0;
};

export const useProfileId = () =>
    useProfileLO().getValueEnforcing().id;

const logoutHandler = () => {
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    // we need the server to close out too
    window.location = API_BASE_URL + "/oauth2/logout";
};

export const useLogoutHandler = () =>
    logoutHandler;
