'use strict';

import React from 'react';
import {
    Link
} from 'react-router';
import Elemental from 'elemental';
import { GoogleMap, Marker, SearchBox } from "react-google-maps";

require('elemental/less/elemental.less');


let Welcome = React.createClass({
    render: function () {

    	var cards = [];

    	for( var i = 0; i < 20; i++ ) {
			cards.push(
				<Elemental.Card>
					<a href="#">
						Hello
					</a>
				</Elemental.Card>
			);
		}

        return (
            <div className="welcome">

            	<h1 className="u-text-center">Macau Incident Report</h1>

            	<Elemental.Container>
	            	<Elemental.Row>
	            		<Elemental.Col lg="1/4">
	            			{cards}
	            		</Elemental.Col>

	            		<Elemental.Col lg="3/4">
	            			<section style={{height: "800px"}}>
						      <GoogleMap containerProps={{
						          style: {
						            height: "800px",
						          },
						        }}
						        defaultZoom={14}
						        defaultCenter={{lat: 22.1667, lng: 113.5500}}>
						      </GoogleMap>
						    </section>
	            		</Elemental.Col>
	            	</Elemental.Row>
            	</Elemental.Container>

            </div>
        )
    }
});

export default Welcome;
