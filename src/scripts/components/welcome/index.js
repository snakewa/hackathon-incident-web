'use strict';

import React from 'react';
import {
    Link
} from 'react-router';
import { Container, Row, Col, Card, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'elemental';
import { GoogleMap, Marker, SearchBox } from "react-google-maps";

require('elemental/less/elemental.less');

import jquery from 'jquery'
import lodash from 'lodash'

let $ = jquery
let _ = lodash

const GET_URL = 'http://192.168.10.241/get/event'

let Welcome = React.createClass({

	   getInitialState: function() {
        return {
            incidents: [],
            modalIsOpen: false,
        };
    },

    toggleModal: function() {
    	this.setState({
    		modalIsOpen: !this.state.modalIsOpen
    	});
    },

    pullIncidents: function(){
      var that = this;
			$.ajax({
				url: GET_URL,
				dataType: 'json',
				cache: false,
				success: function(data) {
					console.log(data);
					if(data.status){
						that.setState({incidents: data.data.events});
					}else{
						console.error('error from pull api1', data );
					}
				},
				error: function(xhr, status, err) {
					console.error('error from pull api2', status, err.toString());
				}.bind(that)
			});
		},

    componentDidMount: function() {
      this.pullIncidents();
    },

    render: function () {
    	var cards = [];
      
      console.log(['state', this.state]);

      _.mapKeys(this.state.incidents, function(value, key) {
          cards.push(
            <Card>
              <a href="#">
                {key}
              </a>
            </Card>
          );  

      });

        return (
            <div className="welcome">
            	<Container>
            		<Row>
            			<Col lg="1/6"></Col>
            			<Col lg="4/6">
            				<h1 className="u-text-center">Macau Incident Report</h1>
            			</Col>
            			<Col lg="1/6" style={{ marginTop: "12px" }}>
            				<Button size="sm" className="u-float-right" onClick={this.toggleModal}>Submit Incident</Button>
            			</Col>
            		</Row>
            	</Container>

            	<Modal isOpen={this.state.modalIsOpen} onCancel={this.toggleModal} backdropClosesModal>
					<ModalHeader text="Lots of text to show scroll behavior" showCloseButton onClose={this.toggleModal} />
					<ModalBody>[...]</ModalBody>
					<ModalFooter>
						<Button type="primary" onClick={this.toggleModal}>Close modal</Button>
						<Button type="link-cancel" onClick={this.toggleModal}>Also closes modal</Button>
					</ModalFooter>
				</Modal>

            	<Container>
	            	<Row>
	            		<Col lg="1/4">

	            			{cards}
	            		</Col>

	            		<Col lg="3/4">
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
	            		</Col>
	            	</Row>
            	</Container>

            </div>
        )
    }
});

export default Welcome;
