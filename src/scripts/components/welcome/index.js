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

const GET_URL = 'http://192.168.10.241/get/event'

let Welcome = React.createClass({

	   getInitialState: function() {
        return {
            incidents: {},
            markers: [],
            modalIsOpen: false,
            
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
             var incidents = data.data.events;
             var  markers = [];
             _.mapKeys(incidents, function(value, key) {
              
                var icon = that.props.incident_icons[value.type] ? that.props.incident_icons[value.type]['icon'] : undefined;
                console.log('icon',icon)
                markers.push(
                  {
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

    handleMarkerClick: function(marker){
      marker.showInfo = true;

      console.log(marker);
    this.setState(this.state);


    },

  handleCloseclick (marker) {
    marker.showInfo = false;
    this.setState(this.state);
  },


    renderInfoWindow (ref, marker) {
    console.log('renderInfoWindow',ref, marker);
    
      // Normal version: Pass string as content
      return (
        <InfoWindow
          content={marker.content}
          onCloseclick={this.handleCloseclick.bind(this, marker)}
           key={`${ref}_info_window`}
          >
          <div>
            <strong>{marker.content}</strong><br/>
            <img className="map_icon" src={marker.media_url}/>
            
          </div>
          </InfoWindow>
      );
  },

    render: function () {
    	var cards = [];
      
      console.log(['state', this.state]);
      
      var ii = 0;
      _.mapKeys(this.state.incidents, function(value, key) {
          ii++
          var time = moment(value.timestamp*1,'X').fromNow(); // 4 years ago
          cards.push(
            <Card key={'c'+ii}>
              <a href="#">
                {value.message} by {value.createBy} ({time})
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
							<FormField label="Type" htmlFor="basic-form-input-email">
								<FormSelect autofocus options={this.props.incident_types} firstOption="-- Please Select --" name="incident_category" />
							</FormField>
							<FormField label="Description" htmlFor="basic-form-input-text">
								<FormInput placeholder="Description" name="incident_description" multiline />
							</FormField>
							<FormField label="Image" htmlFor="basic-form-input-image">
								<FileUpload buttonLabelInitial="Select Image" accept="image/jpg, image/gif, image/png" name="incident_image" multiline />
							</FormField>

							<hr/>

							<Button type="primary">Submit</Button>
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
