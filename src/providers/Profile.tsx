import BaseAxios from "axios";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import LoadObject from "util/LoadObject";
import {
  API_BASE_URL,
  LOCAL_STORAGE_ACCESS_TOKEN
} from "../constants";
import GTag from "../GTag";
import { Maybe } from "graphql/jsutils/Maybe";
import { UserType } from "../global/types/types";

// global side effect to ensure cookies are passed
BaseAxios.defaults.withCredentials = true;

const axios = BaseAxios.create({
    baseURL: API_BASE_URL,
});

const ProfileLOContext = createContext<Maybe<LoadObject<UserType>>>(undefined);

let globalProfileLoadObject;

export const ProfileProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [profileLO, setProfileLO] =
        useState<Maybe<LoadObject<UserType>>>(undefined);

    const doSetProfileLO = useCallback(
        (valueOrUpdater) => {
            const next =
                typeof valueOrUpdater === "function"
                    ? valueOrUpdater(globalProfileLoadObject)
                    : valueOrUpdater;
            setProfileLO((globalProfileLoadObject = next));
        },
        [setProfileLO],
    );

    useEffect(() => {
        if (profileLO) {
            if (profileLO.hasValue()) return;
            if (!profileLO.isDone()) return;
            if (profileLO.hasError()) return;
        }
        axios
            .get("/api/user/me")
            .then((data) => {
                GTag("set", {
                    uid: data.data.id,
                });
                doSetProfileLO((lo) => lo.setValue(data.data).done());
            })
            .catch((error) => {
                if (isAuthError(error)) {
                    doSetProfileLO(
                        LoadObject.withError(
                            new Error(ProfileState.ERR_NO_TOKEN),
                        ),
                    );
                } else {
                    doSetProfileLO((lo) => lo.setError(error).done());
                }
            });
        doSetProfileLO((lo) => (lo ? lo.loading() : LoadObject.loading()));
    }, [profileLO, doSetProfileLO]);
    return (
        <ProfileLOContext.Provider value={profileLO}>
            {children}
        </ProfileLOContext.Provider>
    );
};

export const isAuthError = (error) =>
    error &&
    ((error.response && error.response.status === 401) ||
        (error.extensions &&
            error.extensions.type === "NoUserPrincipalException"));

let lastReauthPrompt = 0;
const promptForReauthFrequency = 10 * 60 * 1000;

export const askUserToReauth = () => {
    if (!globalProfileLoadObject || !globalProfileLoadObject.hasValue()) {
        return false;
    }
    const now = Date.now();
    if (now < lastReauthPrompt + promptForReauthFrequency) {
        // eslint-disable-next-line no-console
        console.log("Asking user to reauth skipped - too soon again");
        return false;
    }
    lastReauthPrompt = now;
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Your session has terminated.\n\nLog back in?")) {
        logoutHandler();
    }
    return true;
};

export const useProfileLO = () =>
    useContext(ProfileLOContext) || LoadObject.loading();

const ProfileState = {
    AUTHENTICATED: "AUTHENTICATED",
    INITIALIZING: "INITIALIZING",
    PENDING: "PENDING",
    ANONYMOUS: "ANONYMOUS",
    ERR_NO_TOKEN: "ERR_NO_TOKEN",
    ERROR: "ERROR",
};

export const useProfileState = () => {
    const lo = useProfileLO();
    if (!lo) return ProfileState.INITIALIZING;
    if (lo.hasValue()) return ProfileState.AUTHENTICATED;
    if (!lo.isDone()) return ProfileState.PENDING;
    if (lo.hasError()) {
        const message = lo.getErrorEnforcing().message;
        return ProfileState.hasOwnProperty(message)
            ? message
            : ProfileState.ERROR;
    }
    return ProfileState.ANONYMOUS;
};

export const useIsProfileInitializing = () =>
    useProfileState() === ProfileState.INITIALIZING;

export const useIsProfilePending = () =>
    useProfileState() === ProfileState.PENDING;

export const useIsAuthenticated = () =>
    useProfileState() === ProfileState.AUTHENTICATED;

export const useProfile = () => useProfileLO().getValueEnforcing();

export const useProfileId = () => useProfile().id;

export const useIsDeveloper = () => {
    const lo = useProfileLO();
    if (!lo.hasValue()) return false;
    if (!lo.isDone()) return false; // in-flight means "gotta wait"
    const profile = lo.getValueEnforcing();
    return profile.roles && profile.roles.indexOf("DEVELOPER") >= 0;
};

const logoutHandler = () => {
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    // we need the server to close out too
    window.location.href = API_BASE_URL + "/oauth2/logout";
};

export const useLogoutHandler = () => logoutHandler;
