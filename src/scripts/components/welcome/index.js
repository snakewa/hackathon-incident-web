'use strict';

import React from 'react';
import {
    Link
} from 'react-router';
import Elemental from 'elemental';

require('elemental/less/elemental.less');

let Welcome = React.createClass({
    render: function () {
        return (
            <div className="welcome">
                Welcome componet here
                <Elemental.Button type="primary">Primary</Elemental.Button>
            </div>
        )
    }
});

export default Welcome;
