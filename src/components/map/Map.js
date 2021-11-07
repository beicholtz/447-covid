import * as L from 'leaflet';
import {MapContainer, GeoJSON} from 'react-leaflet'; //useMap
import countyData from './mapData.json';
import "leaflet/dist/leaflet.css";
import statesData from './states.json';
import FIPStoState from './toState.json';
import React from 'react';


class Map extends React.Component {
  
  constructor(props) {
    super(props);
    this.countyStyle = {
      fillColor: '#EC6A32',
      weight: 1,
      opacity: 1,
      color: 'black',
      fillOpacity: 1
    }

    this.stateStyle = {
      fillColor: 'transparent',
      fillOpacity: 0.0,
      color: '#BFC0C0',
      weight: 1,
      opacity: 1,
    }

    this.leafletMap = React.createRef();
    this.chosenState = undefined
    this.bounds = L.latLngBounds(L.latLng(51,-127), L.latLng(17,-64))
    this.onEachFeature = this.onEachFeature.bind(this);
    this.updateProps = this.updateProps.bind(this);
  }

  /* 
    Add events to each counties geoJSON layer. This allows for the hovering to display the county name and state.
    This function implements the connection to the searchbar. This is done by using the handler prop.
  */
  onEachFeature(feature, layer){
    layer.bindPopup(feature.properties.NAME + ", " + FIPStoState[feature.properties.STATE])
    layer.on({
      mouseover: function(e){layer.openPopup()},
      mouseout: function(e){layer.closePopup()},
      click: () => this.updateProps(feature),
    });
  }

  /*
    Helper functions that makes useage of the handler passed into map via App
    Passes an Array with the name of the county and state and its FIPS code
  */
  updateProps(feature){
    this.props.handler([feature.properties.NAME + ", " + FIPStoState[feature.properties.STATE] , feature.properties.STATE + feature.properties.COUNTY])
  }

  /* 
    Called when the props update. For now this controls the map moving over to allow for the sidebar to have room
  */
  componentDidUpdate(){
    document.getElementById("transformOnChange").style.width="75vw";  
    this.leafletMap.current.invalidateSize();
  }

  render() {
    return (
      <div className="mapdiv" id="transformOnChange" style={{width: '100vw'}}> 
        <MapContainer style={{height: "90vh", width: 'inherit', background:"transparent"}} 
                      zoom={4.8} center={[35, -95.83]} zoomDelta={0.33} zoomSnap={0} minZoom={4.6}
                      maxBounds={this.bounds}
                      whenCreated={ mapInstance => { this.leafletMap.current = mapInstance } }>
          <GeoJSON 
            style={this.countyStyle}
            data={countyData.features}
            onEachFeature={this.onEachFeature}
          />
          <GeoJSON 
            style={this.stateStyle}
            data={statesData.features}
            interactive={false}
          />
        </MapContainer>
      </div>
    );
  }


}
export default Map;