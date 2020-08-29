import BaseAxios from "axios";
import { ReduceStore } from "flux/utils";
import { OrderedMap } from "immutable";
import {
    API_BASE_URL,
    COOKIE_AUTH_TOKEN,
    LOCAL_STORAGE_ACCESS_TOKEN,
} from "../constants/index";
import { getCookie } from "../util/cookies";
import hotLoadObject from "../util/hotLoadObject";
import LoadObject from "../util/LoadObject";
import promiseFlux from "../util/promiseFlux";
import Dispatcher from "./dispatcher";
import UserActions from "./UserActions";

// global side effect to ensure cookies are passed
BaseAxios.defaults.withCredentials = true;

const axios = BaseAxios.create({
    baseURL: API_BASE_URL,
});

const initiateProfileLoad = state => {
    if (state.get("profile").isLoading()) {
        return state;
    }
    promiseFlux(
        axios.get("/api/user/me"),
        data => ({
            type: UserActions.PROFILE_LOADED,
            data: data.data,
        }),
        UserActions.PROFILE_LOAD_ERROR,
    );
    return state.update("profile", lo =>
        lo.loading());
};

const setToken = (state, token) => {
    return initiateProfileLoad(
        state.set("token", token)
    );
};

class UserStore extends ReduceStore {

    getInitialState() {
        const state = new OrderedMap({
            profile: LoadObject.empty(),
        });
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
                return state.update("profile", lo =>
                    lo.setValue(action.data).done());
            }
            case UserActions.PROFILE_LOAD_ERROR: {
                return state.update("profile", lo =>
                    lo.setError(action.error).done());
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
        return s.get("token") != null && s.get("profile").hasValue();
    }

    getToken() {
        return this.getState().get("token");
    }

    getProfileLO() {
        return hotLoadObject(
            () => this.getState().get("profile"),
            () => Dispatcher.dispatch({
                type: UserActions.LOAD_PROFILE
            })
        );
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