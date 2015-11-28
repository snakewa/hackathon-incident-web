'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Layout from './components/layout';
import Welcome from './components/welcome'
import Aboutus from './components/aboutus'
import createHashHistory from 'history/lib/createHashHistory'

import {
    Router,
    IndexRoute,
    Route,
    IndexRedirect
} from 'react-router';

require('../styles/base.scss');

ReactDOM.render(
    <Router history={createHashHistory()}>
        <Route path="/" component={Layout}>
            <Route path="welcome" component={Welcome}/>
            <Route path="aboutus" component={Aboutus}/>
            <IndexRedirect to={'welcome'}/>
        </Route>
    </Router>
    , document.getElementById('app'), function () {
    }
);