'use strict';

import React from 'react';
import {
    Link
} from 'react-router';
import Elemental from 'elemental';
import { GoogleMap, Marker, SearchBox } from "react-google-maps";

require('elemental/less/elemental.less');

import jquery from 'jquery'

const GET_URL = 'http://192.168.10.241/get/event'

let Welcome = React.createClass({

    getInitialState: function() {
        return {
            incidents: []
        };
    },

    componentDidMount: function() {

      jquery.ajax({
        url: GET_URL,
        dataType: 'json',
        cache: false,
        success: function(data) {
          console.log(data);
          if(data.status){
              this.setState({incidents: data.events});  
          }
          
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });

    },

    render: function () {
    	var cards = [];
      

    	for( var i = 0; i < 20; i++ ) {
			cards.push(
				<Elemental.Card key={'l'+i}>
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
	            			<section style={{height: "100%"}}>
						      <GoogleMap containerProps={{
						          style: {
						            height: "100%",
						          },
						        }}
						        defaultZoom={3}
						        defaultCenter={{lat: -25.363882, lng: 131.044922}}>
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
