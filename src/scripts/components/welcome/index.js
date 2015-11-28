'use strict';

import React from 'react';
import {
    Link
} from 'react-router';
import { Container, Row, Col, Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormField, Checkbox, FormInput, FormSelect, FileUpload } from 'elemental';
import { GoogleMap, Marker, SearchBox , InfoWindow} from "react-google-maps";

require('elemental/less/elemental.less');

import jquery from 'jquery'
import lodash from 'lodash'
import moment from 'moment'

let $ = jquery
let _ = lodash

// const API_ROOT = 'http://192.168.10.241'
// const GET_URL = 'http://192.168.10.241/get/event'

const API_ROOT = 'http://incident-report.lovabird.com'
const GET_URL = 'http://incident-report.lovabird.com/get/event'


var timer_handler = false;
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
            {label: '抄牌', value: 'fine'}
          ],
          incident_icons: {
            'traffic':{'icon':'http://www.tortue.me/emoji/traffic_light.png'},
            'traffic-jam':{ 'icon':'http://www.tortue.me/emoji/checkered_flag.png'},
            'road-change': {'icon':'http://www.tortue.me/emoji/construction.png'},
            'fine': {'icon':'http://www.tortue.me/emoji/oncoming_police_car.png'},
          },


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
              
                var icon = that.props.incident_icons[value.type] ? that.props.incident_icons[value.type]['icon'] : undefined;
                console.log('icon',icon);
                markers.push( {
                    position: {
                      lat: 1*value.lat,
                      lng: 1*value.long,
                    },
                    key: key,
                    title: value.message,
                    content: value.message,
                    showInfo: false,
                    media_url: value.media_url,
                    icon: icon,
                    defaultAnimation: 2,
                  });

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
      var that = this;
      var do_refresh = function(){
          that.pullIncidents();
      };

      var timer_handler = setInterval(function(){
          do_refresh();
      },3000);
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


    	var r = 800 / 111300; // = 100 meters
		var y0 = this.state.latitude;
		var x0 = this.state.longitude;
		var u = Math.random();
		var v = Math.random();
		var w = r * Math.sqrt(u);
		var t = 2 * Math.PI * v;
		var x = w * Math.cos(t);
		var y1 = w * Math.sin(t);
		var x1 = x / Math.cos(y0);

		var newY = y0 + y1;
		var newX = x0 + x1;

    	$.ajax({
		    url: API_ROOT + '/post/event',
		    data: JSON.stringify({
		    	createBy: user,
		    	type: category,
		    	message: description,
		    	media_url: image_url,
		    	lat: newY,
		    	long: newX
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

            setTimeout(function(){
              that.pullIncidents();
            },500);
		        
		    }
		});
	},

    onMarkerRightclick: function(index){
        console.log(index);
    },

    handleMarkerClick: function(marker){

      for( var i =0 ; i < this.state.markers.length ; i++ ){
          this.state.markers[i].showInfo = false;
      }
      marker.showInfo = true;
      console.log(marker);
      this.setState({markers: this.state.markers});
  },

  handleCloseclick (marker) {
    marker.showInfo = false;
    this.setState({markers: this.state.markers});
  },

  handleCardClick(ref){
    console.log('handleCardClick',ref);
    if(this.state.markers[ref]){
      this.handleMarkerClick(this.state.markers[ref]);
    }
  },


    renderInfoWindow (ref, marker) {
    console.log('renderInfoWindow',ref, marker);
      var media_url = marker.media_url ? (
            /^\//i.test(marker.media_url) ? ( API_ROOT + marker.media_url) : marker.media_url
        ) : false;
      // Normal version: Pass string as content
      return (
        <InfoWindow
          content={marker.content}
          onCloseclick={this.handleCloseclick.bind(this, marker)}
           key={`${ref}_info_window`}
          >
          <div>
            <strong>{marker.content}</strong><br/>
            { media_url ? (<img className="map_icon" src={media_url}/>) : null }
            
          </div>
          </InfoWindow>
      );
  },

    render: function () {
    	var cards = [];
      

       //console.log(['state', this.state]);

      var ii = 0;
      var that = this;

      _.mapKeys(this.state.incidents, function(value, key) {
          
          var time = moment(value.timestamp*1,'X').fromNow(); // 4 years ago

          cards.push(
            <Card key={'c'+ii} onClick={that.handleCardClick.bind(that,ii)}>
              <a href="#">
                {value.message} by {value.createBy} ({time})
              </a>
            </Card>
          );  
          ii++
      });

        return (
            <div className="welcome">
            	<Container>
            		<Row>
            			<Col lg="1/6"></Col>
            			<Col lg="4/6">
            				<h1 className="elegantshadow u-text-center">Macau Incident Report</h1>
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
	            			{cards.reverse()}
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
                      const ref = `marker_${index}`;
                      return (
                        <Marker key={ref} ref={ref}
                          {...marker}
                          onClick={this.handleMarkerClick.bind(this, marker)}>
                          {marker.showInfo ? this.renderInfoWindow(ref, marker) : null}
                        </Marker>
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
