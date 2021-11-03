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
    this.bounds = L.latLngBounds(L.latLng(51,-131), L.latLng(17,-64))
    this.onEachFeature = this.onEachFeature.bind(this);
    this.updateProps = this.updateProps.bind(this);
  }

  onEachFeature(feature, layer, props){
    layer.bindPopup(feature.properties.NAME + ", " + FIPStoState[feature.properties.STATE])
    layer.on({
      mouseover: function(e){layer.openPopup()},
      mouseout: function(e){layer.closePopup()},
      click: () => this.updateProps(feature),
    });
  }

  updateProps(feature){
    this.props.handler([feature.properties.NAME + ", " + FIPStoState[feature.properties.STATE] , feature.properties.STATE + feature.properties.COUNTY])
  }

  removeCounties(){
    if(this.chosenState){
      this.leafletMap.current.removeLayer(this.chosenState);
    }
  }

  componentDidUpdate(){
    document.getElementById("transformOnChange").style.width="75vw";  
    
    this.leafletMap.current.invalidateSize();
  }

  // stateClicked = (feature) => {
  //   var stateSpecific = {"type": "FeatureCollection", "features":[]};
  //   for(var i = 0; i < countyData.features.length; i++){
  //     if(countyData.features[i].properties.STATE === feature.properties.STATE){
  //       stateSpecific.features.push(countyData.features[i]);
  //     }
  //   }
    
  //   this.removeCounties(this.leafletMap);
    
  //   this.chosenState = L.geoJSON(stateSpecific.features, {style: this.countyStyle, onEachFeature: this.onEachFeature});

  //   this.leafletMap.current.addLayer(this.chosenState);
  // }

  // showCounties = (feature, layer) =>{
  //   layer.on({
  //     mouseover: () => this.stateClicked(feature),
  //   });

  // }

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
            // onEachFeature={this.showCounties}
          />
        </MapContainer>
      </div>
    );
  }


}
export default Map;