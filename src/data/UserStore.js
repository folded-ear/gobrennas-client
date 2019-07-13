import { ReduceStore } from "flux/utils"
import Dispatcher from './dispatcher'
import { OrderedMap } from "immutable"
import UserActions from "./UserActions"
import LoadObject from "../util/LoadObject"
import {
    API_BASE_URL,
    LOCAL_STORAGE_ACCESS_TOKEN,
} from "../constants/index"
import hotLoadObject from "../util/hotLoadObject"
import promiseFlux from "../util/promiseFlux"
import axios from "axios"

const initiateProfileLoad = state => {
    if (state.get("profile").isLoading()) {
        return state
    }
    if (state.get("token") == null) {
        return state.update("profile", lo =>
            lo.setError("No Access Token Found").done())
    }
    promiseFlux(
        axios.get(API_BASE_URL + "/api/user/me"),
        data => ({
            type: UserActions.PROFILE_LOADED,
            data: data.data,
        }),
        UserActions.PROFILE_LOAD_ERROR,
    )
    return state.update("profile", lo =>
        lo.loading())
}

const setToken = (state, token) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return initiateProfileLoad(
        state.set("token", token)
    )
}

class UserStore extends ReduceStore {
    constructor() {
        super(Dispatcher)
    }

    getInitialState() {
        const state = new OrderedMap({
            profile: LoadObject.empty(),
        })
        const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN)
        return token ? setToken(state, token) : state
    }

    reduce(state, action) {
        switch (action.type) {
            case UserActions.LOGGED_IN: {
                localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, action.token)
                return setToken(state, action.token)
            }
            case UserActions.LOAD_PROFILE: {
                return initiateProfileLoad(state)
            }
            case UserActions.PROFILE_LOADED: {
                return state.update("profile", lo =>
                    lo.setValue(action.data).done())
            }
            case UserActions.PROFILE_LOAD_ERROR: {
                return state.update("profile", lo =>
                    lo.setError(action.error).done())
            }
            case UserActions.LOGOUT: {
                localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN)
                return this.getInitialState()
            }
            default:
                return state
        }
    }

    isAuthenticated() {
        const s = this.getState()
        return s.get("token") != null && s.get("profile").hasValue()
    }

    getProfileLO() {
        return hotLoadObject(
            () => this.getState().get("profile"),
            () => Dispatcher.dispatch({
                type: UserActions.LOAD_PROFILE
            })
        )
    }

    isDeveloper() {
        const lo = this.getProfileLO()
        if (! lo.hasValue()) return false
        if (! lo.isDone()) return false // in-flight means "gotta wait"
        const profile = lo.getValueEnforcing()
        return profile.roles && profile.roles.indexOf("DEVELOPER") >= 0
    }

}

export default new UserStore()