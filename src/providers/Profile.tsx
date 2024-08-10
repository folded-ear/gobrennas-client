import BaseAxios from "axios";
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { API_BASE_URL, LOCAL_STORAGE_ACCESS_TOKEN } from "@/constants";
import GTag from "../GTag";
import type { UserType } from "@/global/types/identity";
import { requiredData, RippedLO } from "@/util/ripLoadObject";

// global side effect to ensure cookies are passed
BaseAxios.defaults.withCredentials = true;

const axios = BaseAxios.create({
    baseURL: API_BASE_URL,
});

type Profile = RippedLO<UserType> | undefined;

let globalProfile: Profile = undefined;

const ProfileContext = createContext<Profile>(globalProfile);

type Props = PropsWithChildren<unknown>;

export const ProfileProvider: React.FC<Props> = ({ children }) => {
    const [profile, setProfile] = useState(globalProfile);

    const doSetProfile = useCallback(
        (valueOrUpdater: Profile | ((p: Profile) => Profile)) => {
            const next =
                typeof valueOrUpdater === "function"
                    ? valueOrUpdater(globalProfile)
                    : valueOrUpdater;
            setProfile((globalProfile = next));
        },
        [setProfile],
    );

    useEffect(() => {
        if (profile) {
            if (profile.data) return;
            if (profile.loading || profile.deleting) return;
            if (profile.error) return;
        }
        axios
            .get("/api/user/me")
            .then((data) => {
                GTag("set", {
                    uid: data.data.id,
                });
                doSetProfile({
                    data: data.data,
                });
            })
            .catch((error) => {
                if (isAuthError(error)) {
                    doSetProfile({
                        error: new Error(ProfileState.ERR_NO_TOKEN),
                    });
                } else {
                    doSetProfile({
                        error,
                    });
                }
            });
        doSetProfile((p) => ({ ...(p || {}), loading: true }));
    }, [profile, doSetProfile]);
    return (
        <ProfileContext.Provider value={profile}>
            {children}
        </ProfileContext.Provider>
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
    if (!globalProfile?.data) {
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

export const usePendingProfile = () => useContext(ProfileContext) || {};

const ProfileState = {
    AUTHENTICATED: "AUTHENTICATED",
    INITIALIZING: "INITIALIZING",
    PENDING: "PENDING",
    ANONYMOUS: "ANONYMOUS",
    ERR_NO_TOKEN: "ERR_NO_TOKEN",
    ERROR: "ERROR",
};

export const useProfileState = () => {
    const pendingProfile = useContext(ProfileContext);
    if (!pendingProfile) return ProfileState.INITIALIZING;
    if (pendingProfile.data) return ProfileState.AUTHENTICATED;
    if (pendingProfile.loading) return ProfileState.PENDING;
    if (pendingProfile.error) {
        const message = pendingProfile.error.message;
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

export const useProfile = () => requiredData(useContext(ProfileContext));

export const useProfileId = () => useProfile().id;

export const useIsDeveloper = () => {
    const pendingProfile = useContext(ProfileContext);
    if (!pendingProfile?.data) return false;
    if (pendingProfile.loading) return false; // in-flight means "gotta wait"
    const profile = requiredData(pendingProfile);
    return profile.roles && profile.roles.indexOf("DEVELOPER") >= 0;
};

const logoutHandler = () => {
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    // we need the server to close out too
    window.location.href = API_BASE_URL + "/oauth2/logout";
};

export const useLogoutHandler = () => logoutHandler;
