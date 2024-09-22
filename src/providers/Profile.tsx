import Axios from "axios";
import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
} from "react";
import { API_BASE_URL, LOCAL_STORAGE_ACCESS_TOKEN } from "@/constants";
import GTag from "../GTag";
import type { UserType } from "@/global/types/identity";
import { requiredData, RippedLO } from "@/util/ripLoadObject";
import { gql } from "@/__generated__";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";

// global side effect to ensure cookies are passed
Axios.defaults.withCredentials = true;

type Profile = RippedLO<UserType> | undefined;

let globalProfile: Profile = undefined;

const GET_ME = gql(`query me {
  getCurrentUser {
    id
    name
    email
    imageUrl
    provider
    roles
  }
}`);

const ProfileContext = createContext<Profile>(undefined);

type Props = PropsWithChildren<unknown>;

export const ProfileProvider: React.FC<Props> = ({ children }) => {
    const profile: Profile = useAdaptingQuery(
        GET_ME,
        (data) => data?.getCurrentUser || undefined,
    );

    useEffect(() => {
        globalProfile = profile;
    }, [profile]);

    useEffect(() => {
        const uid = profile.data?.id;
        if (uid) GTag("set", { uid });
    }, [profile.data?.id]);

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
        const error = isAuthError(pendingProfile.error)
            ? new Error(ProfileState.ERR_NO_TOKEN)
            : pendingProfile.error;
        const message = error.message;
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
