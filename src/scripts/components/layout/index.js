'use strict';

import React, {Component} from 'react'
import {
    Link
} from 'react-router'

let Layout = React.createClass({
    render() {
        var self = this;
        var mainClass = "layout"
        return (
            <div className={mainClass}>
                Layout:

                <Link to="/welcome">Welcome</Link> | <Link to="/aboutus">About us</Link>
                {this.props.children}
            </div>
        );
    }
});

export default Layout;
