import React from 'react';
import { Redirect } from 'react-router-dom'

const Landing = ({authenticated}) => authenticated ? <Redirect to="/recipes" /> : <Redirect to="/login"/>

export default Landing;
