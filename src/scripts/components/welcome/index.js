'use strict';

import React from 'react';
import {
    Link
} from 'react-router';
import { Container, Row, Col, Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormField, Checkbox, FormInput, FormSelect, FileUpload } from 'elemental';
import { GoogleMap, Marker, SearchBox } from "react-google-maps";

require('elemental/less/elemental.less');

import jquery from 'jquery'
import lodash from 'lodash'

let $ = jquery
let _ = lodash

const API_ROOT = 'http://192.168.10.241'
const GET_URL = 'http://192.168.10.241/get/event'

let Welcome = React.createClass({

	getInitialState: function() {
        return {
            incidents: {},
            markers: [],
            modalIsOpen: false,
            latitude: null,
            longitude: null
        };
    },

    getDefaultProps: function() {
    	return {
    		incident_types: [
	        	{label: '交通', value: 'traffic'},
	        	{label: '塞車', value: 'traffic-jam'},
	        	{label: '改道', value: 'road-change'},
	        	{label: '抄牌', value: 'fine'},
	        ],


    	};
    },

    toggleModal: function() {

    	if( this.state.modalIsOpen == false ) {
    		console.log('Getting Geolocation');
    		navigator.geolocation.getCurrentPosition(this.GetLocation);
    	}

    	this.setState({
    		modalIsOpen: !this.state.modalIsOpen
    	});
    },

    GetLocation: function(location) {
	    this.setState({
	    	latitude: location.coords.latitude,
	    	longitude: location.coords.longitude
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
             var incidents = data.data.events;
             var  markers = [];
             _.mapKeys(incidents, function(value, key) {
                markers.push(
                  {
                    position: {
                      lat: 1*value.lat,
                      lng: 1*value.long,
                    },
                    key: key,
                    defaultAnimation: 2,
                  }
                );
            });
             console.log('update',{incidents: data.data.events, markers:markers})
						that.setState({incidents: data.data.events, markers:markers});
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

    submitIncident: function() {

    	var that = this;
    	var image = $('input[name="incident_image"]');

    	var data = new FormData();
		$.each(image[0].files, function(i, file) {
		    data.append('image', file);
		});

		$.ajax({
		    url: API_ROOT + '/media/upload',
		    data: data,
		    cache: false,
		    contentType: false,
		    processData: false,
		    type: 'POST',
		    success: function(data){
		        // console.log(data);

		        if( !data.status || data.data.files.length == 0 ) {
		        	alert( data.message );
		        	return false;
		        }

		        var image_url = data.data.files[0];

		        console.log(data);

		        that.createIncident( image_url );
		    }
		});
    },

    createIncident: function( image_url ) {

    	var that = this;

    	var user = $('input[name="username"]').val();
    	var category = $('select[name="incident_category"] option:selected').val();
    	var description = $('textarea[name="incident_description"]').val();

    	$.ajax({
		    url: API_ROOT + '/post/event',
		    data: JSON.stringify({
		    	createBy: user,
		    	type: category,
		    	message: description,
		    	media_url: image_url,
		    	lat: this.state.latitude,
		    	long: this.state.longitude
		    }),
		    cache: false,
		    contentType: false,
		    processData: false,
		    type: 'POST',
		    success: function(data){
		        // console.log(data);

		        if( !data.status ) {
		        	alert( data.message );
		        	return false;
		        }

		        that.setState({
		        	modalIsOpen: false
		        });
		        
		    }
		});
	},

    onMarkerRightclick: function(index){
        console.log(index);
    },

    render: function () {
    	var cards = [];
      

       //console.log(['state', this.state]);

      var ii = 0;

      _.mapKeys(this.state.incidents, function(value, key) {
          ii++
          cards.push(
            <Card key={'c'+ii}>
              <a href="#">
                {value.message} by {value.createBy} ({value.createdAt})
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
					<ModalHeader text="Submit Incident" showCloseButton onClose={this.toggleModal} />
					<ModalBody>
						<Form>
							<FormField label="Your Name" htmlFor="username">
								<FormInput autofocus name="username" />
							</FormField>

							<FormField label="Type" htmlFor="incident_category">
								<FormSelect autofocus options={this.props.incident_types} firstOption="-- Please Select --" name="incident_category" />
							</FormField>

							<FormField label="Description" htmlFor="incident_description">
								<FormInput placeholder="Description" name="incident_description" multiline />
							</FormField>

							<FormField label="Image" htmlFor="incident_image">
								<FileUpload buttonLabelInitial="Select Image" accept="image/jpg, image/jpeg, image/gif, image/png" name="incident_image" multiline />
							</FormField>

							<hr/>

							<Button type="primary" onClick={this.submitIncident}>Submit</Button>
						</Form>
					</ModalBody>
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
						        defaultZoom={13}
						        defaultCenter={{lat: 22.1667, lng: 113.5500}}>
                     {this.state.markers.map((marker, index) => {
                      return (
                        <Marker
                          {...marker}
                          onRightclick={() => this.onMarkerRightclick(index)} />
                      );
                    })}
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
