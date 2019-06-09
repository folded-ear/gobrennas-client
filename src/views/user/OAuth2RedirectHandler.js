import React, {useEffect} from 'react';
import {ACCESS_TOKEN} from '../../constants';
import {Redirect} from 'react-router-dom'
import Actions from '../../data/actions';

function getUrlParameter(name, location) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

const OAuth2RedirectHandler = ({location}) => {
    
    const token = getUrlParameter('token', location);
    const error = getUrlParameter('error', location);
    
    useEffect(() => Actions.user.setCurrentUser(token));
    
    if (token) {
        localStorage.setItem(ACCESS_TOKEN, token);
        return <Redirect to={{
            pathname: "/recipes",
            state: {from: location}
        }}/>
    } else {
        return <Redirect to={{
            pathname: "/login",
            state: {
                from: location,
                error: error
            }
        }}/>;
    }
};

export default OAuth2RedirectHandler;