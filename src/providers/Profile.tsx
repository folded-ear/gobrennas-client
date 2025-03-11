import { gql } from "@/__generated__";
import { API_BASE_URL, LOCAL_STORAGE_ACCESS_TOKEN } from "@/constants";
import dispatcher, { ActionType } from "@/data/dispatcher";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import type { UserType } from "@/global/types/identity";
import { requiredData, RippedLO } from "@/util/ripLoadObject";
import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
} from "react";
import GTag from "../GTag";

type Profile = RippedLO<UserType> | undefined;

let globalProfile: Profile = undefined;

const GET_ME = gql(`query me {
  profile {
    me {
      id
      name
      email
      imageUrl
      provider
      roles
    }
  }
}`);

const ProfileContext = createContext<Profile>(undefined);

type Props = PropsWithChildren;

export const ProfileProvider: React.FC<Props> = ({ children }) => {
    const profile: Profile = useAdaptingQuery(
        GET_ME,
        (data) => data?.profile.me || undefined,
    );

    useEffect(() => {
        globalProfile = profile;
    }, [profile]);

    useEffect(() => {
        const uid = profile.data?.id;
        if (uid) {
            GTag("set", { uid });
            dispatcher.dispatch({
                type: ActionType.USER__AUTHENTICATED,
            });
        }
    }, [profile.data?.id]);

    return (
        <ProfileContext.Provider value={profile}>
            {children}
        </ProfileContext.Provider>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAuthError = (error: any): boolean => {
    if (!error) return false;
    if (error.response && error.response.status === 401) return true;
    if (error.extensions?.type === "NoUserPrincipalException") return true;
    return error.graphQLErrors?.some(isAuthError);
};

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

const useProfileState = () => {
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
