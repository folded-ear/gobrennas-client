import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';
import { OrderedMap } from "immutable";
import UserActions from "./UserActions";
import LoadObject from "../util/LoadObject";
import {
    ACCESS_TOKEN,
    API_BASE_URL,
} from "../constants/index";
import hotLoadObject from "../util/hotLoadObject";
import promiseFlux from "../util/promiseFlux";
import axios from "axios";

const initiateProfileLoad = state => {
    if (state.get("profile").isLoading()) {
        return state;
    }
    if (state.get("token") == null) {
        return state.update("profile", lo =>
            lo.setError("No Access Token Found").done());
    }
    promiseFlux(
        axios.get(API_BASE_URL + "/user/me"),
        data => ({
            type: UserActions.PROFILE_LOADED,
            data: data.data,
        }),
        UserActions.PROFILE_LOAD_ERROR,
    );
    return state.update("profile", lo =>
        lo.loading());
};

class UserStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return new OrderedMap({
            token: null,
            profile: LoadObject.empty(),
        });
    }

    reduce(state, action) {
        switch (action.type) {
            case UserActions.LOGIN: {
                localStorage.setItem(ACCESS_TOKEN, action.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.token}`;
                return initiateProfileLoad(
                    state.set("token", action.token)
                );
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
                localStorage.removeItem(ACCESS_TOKEN);
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

    getProfileLO() {
        return hotLoadObject(
            () => this.getState().get("profile"),
            () => Dispatcher.dispatch({
                type: UserActions.LOAD_PROFILE
            })
        );
    }

}

export default new UserStore();