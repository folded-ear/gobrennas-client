import Dispatcher from '../dispatcher';
import Types from "../types";

const Actions = {
    
    setCurrentUser(token) {
        Dispatcher.dispatch({
            type: Types.SET_CURRENT_USER,
            data: token
        })
    }
};

export default Actions;