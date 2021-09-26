import BaseAxios from "axios";
import { ReduceStore } from "flux/utils";
import {
    API_BASE_URL,
    COOKIE_AUTH_TOKEN,
    LOCAL_STORAGE_ACCESS_TOKEN,
} from "../constants/index";
import GTag from "../GTag";
import { getCookie } from "../util/cookies";
import LoadObjectState from "../util/LoadObjectState";
import promiseFlux from "../util/promiseFlux";
import Dispatcher from "./dispatcher";
import UserActions from "./UserActions";

// global side effect to ensure cookies are passed
BaseAxios.defaults.withCredentials = true;

const axios = BaseAxios.create({
    baseURL: API_BASE_URL,
});

const initiateProfileLoad = state => {
    if (state.profile.getLoadObject().isLoading()) {
        return state;
    }
    promiseFlux(
        axios.get("/api/user/me"),
        data => {
            GTag("set", {
                uid: data.data.id,
            });
            return {
                type: UserActions.PROFILE_LOADED,
                data: data.data,
            };
        },
        UserActions.PROFILE_LOAD_ERROR,
    );
    return {
        ...state,
        profile: state.profile.mapLO(lo =>
            lo.loading())
    };
};

const setToken = (state, token) => {
    return initiateProfileLoad({
        ...state,
        token,
    });
};

class UserStore extends ReduceStore {

    getInitialState() {
        const state = {
            profile: new LoadObjectState(
                () => Dispatcher.dispatch({
                    type: UserActions.LOAD_PROFILE
                })),
        };
        const token = getCookie(COOKIE_AUTH_TOKEN);
        return token ? setToken(state, token) : state;
    }

    reduce(state, action) {
        switch (action.type) {

            case UserActions.LOGGED_IN: {
                return setToken(state, action.token);
            }

            case UserActions.LOAD_PROFILE: {
                return initiateProfileLoad(state);
            }

            case UserActions.PROFILE_LOADED: {
                return {
                    ...state,
                    profile: state.profile.mapLO(lo =>
                        lo.setValue(action.data).done()),
                };
            }

            case UserActions.PROFILE_LOAD_ERROR: {
                return {
                    ...state,
                    profile: state.profile.mapLO(lo =>
                        lo.setError(action.error).done())
                };
            }

            case UserActions.LOGOUT: {
                localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
                // we need the server to close out too
                window.location = API_BASE_URL + "/oauth2/logout";
                return this.getInitialState();
            }

            default:
                return state;
        }
    }

    isAuthenticated() {
        const s = this.getState();
        return s.token != null && s.profile.getLoadObject().hasValue();
    }

    getToken() {
        return this.getState().token;
    }

    getProfileLO() {
        return this.getState().profile.getLoadObject();
    }

    isDeveloper() {
        const lo = this.getProfileLO();
        if (! lo.hasValue()) return false;
        if (! lo.isDone()) return false; // in-flight means "gotta wait"
        const profile = lo.getValueEnforcing();
        return profile.roles && profile.roles.indexOf("DEVELOPER") >= 0;
    }

}

export default new UserStore(Dispatcher);
