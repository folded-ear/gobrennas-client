import React from 'react'
import Dispatcher from '../../data/dispatcher'
import { Redirect } from 'react-router-dom'
import UserActions from "../../data/UserActions"

function getUrlParameter(name, location) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
    
    var results = regex.exec(location.search)
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

const OAuth2RedirectHandler = ({location}) => {
    const token = getUrlParameter('token', location)
    const error = getUrlParameter('error', location)

    if (token) {
        // This has to be deferred to avoid reentrant dispatch. It seems kinda
        // kludge-y, but I'm not sure how else to process URL params for a
        // specific Route, as the routed Component gets rendered and there isn't
        // an obvious way to do a code-only route that redirects.
        setTimeout(() => Dispatcher.dispatch({
            type: UserActions.LOGGED_IN,
            token,
        }))
        return <Redirect to={{
            pathname: "/",
            state: {from: location}
        }}/>
    } else {
        return <Redirect to={{
            pathname: "/login",
            state: {
                from: location,
                error: error
            }
        }}/>
    }
}

export default OAuth2RedirectHandler