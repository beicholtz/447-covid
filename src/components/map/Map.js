import * as L from 'leaflet';
import {MapContainer, GeoJSON, LayersControl, LayerGroup} from 'react-leaflet'; //useMap
import countyData from './mapData.json';
import "leaflet/dist/leaflet.css";
import statesData from './states.json';
import FIPStoState from './toState.json';
import React from 'react';

class Map extends React.Component {
  // TODO: Move placement of where the layer control is
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
    this.chosenState = undefined;
    this.choroplethData = {};
    this.bounds = L.latLngBounds(L.latLng(51,-127), L.latLng(17,-64));
    this.dataLoaded = false;
    
    this.onEachFeature = this.onEachFeature.bind(this);
    this.updateProps = this.updateProps.bind(this);
    this.vaccinationStyle = this.vaccinationStyle.bind(this);
    this.caseStyle = this.caseStyle.bind(this);
    this.deathStyle = this.deathStyle.bind(this);
  };

  getVaccinationColor(d){
    let tmp = this.choroplethData[d];
    if(!tmp){
      return '#000000'
    }
    return tmp[0] > 80? '#800026' :
    tmp[0] > 70  ? '#BD0026' :
    tmp[0] > 60  ? '#E31A1C' :
    tmp[0] > 50  ? '#FC4E2A' :
    tmp[0] > 40  ? '#FD8D3C' :
    tmp[0] > 30   ? '#FEB24C' :
    tmp[0] > 20  ? '#FED976' :
                      '#FFEDA0';
  }

  vaccinationStyle(feature){
    let req = this;
    return {
      fillColor: req.getVaccinationColor(feature.properties.STATE + feature.properties.COUNTY),
      weight: 1,
      opacity: 1,
      color: 'black',
      fillOpacity: 1
    }
  }

  getCaseColor(d){
    let tmp = this.choroplethData[d];
    if(!tmp){
      return '#000000'
    }
    return tmp[1] > 25? '#800026' :
    tmp[1] > 15  ? '#BD0026' :
    tmp[1] > 10  ? '#E31A1C' :
    tmp[1] > 5  ? '#FC4E2A' :
    tmp[1] > 4 ? '#FD8D3C' :
    tmp[1] > 3   ? '#FEB24C' :
    tmp[1] > 2  ? '#FED976' :
                      '#FFEDA0';
  }

  caseStyle(feature){
    let req = this;
    return {
      fillColor: req.getCaseColor(feature.properties.STATE + feature.properties.COUNTY),
      weight: 1,
      opacity: 1,
      color: 'black',
      fillOpacity: 1
    }
  }

  getDeathColor(d){
    let tmp = this.choroplethData[d];
    if(!tmp){
      return '#000000'
    }
    return tmp[1] > 25? '#800026' :
    tmp[1] > 15  ? '#BD0026' :
    tmp[1] > 10  ? '#E31A1C' :
    tmp[1] > 5  ? '#FC4E2A' :
    tmp[1] > 4 ? '#FD8D3C' :
    tmp[1] > 3   ? '#FEB24C' :
    tmp[1] > 2  ? '#FED976' :
                      '#FFEDA0';
  }

  deathStyle(feature){
    let req = this;
    return {
      fillColor: req.getDeathColor(feature.properties.STATE + feature.properties.COUNTY),
      weight: 1,
      opacity: 1,
      color: 'black',
      fillOpacity: 1
    }
  }


  /* 
    Add events to each counties geoJSON layer. This allows for the hovering to display the county name and state.
    This function implements the connection to the searchbar. This is done by using the handler prop.
  */
  onEachFeature(feature, layer){
    layer.bindPopup(feature.properties.NAME + ", " + FIPStoState[feature.properties.STATE], {closeButton:false})
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
    this.props.handler([feature.properties.NAME + ", " + FIPStoState[feature.properties.STATE], feature.properties.STATE + feature.properties.COUNTY])
    var state; // Get state from county selected
    statesData.features.forEach(function(n) {
      // Search JSON array until state fips code found and store object
      if (n['type'] === 'Feature' && n['properties']['STATE'] === feature.properties['STATE'])
        state = n;
      // Hawaii is a feature collection and needs to be treated different
      if (n['type'] === 'FeatureCollection' && n['features'][0].properties['STATE'] === feature.properties['STATE'])
        state = n['features'][0]
    })
    // Set bounds and invalidate size to keep map size
    this.leafletMap.current.fitBounds(L.geoJSON(state).getBounds().pad(0.2));
    this.leafletMap.current.invalidateSize();
  }

  /* 
    Called when the props update. For now this controls the map moving over to allow for the sidebar to have room
  */
  componentDidUpdate(){
    if (this.props.shiftLeft){
      document.getElementById("transformOnChange").style.width="75vw";  
    }
    else {
      document.getElementById("transformOnChange").style.width="100vw";  
    }
    this.leafletMap.current.invalidateSize();
  }

  componentDidMount(){
    let req = this;
    fetch('http://localhost:3072/api/getdata?start=2021-12-16&end=2021-12-16' + this.selectedDate, {
              method: 'GET'
          }).then(function(response){
            let dict = {}
              response.json().then(data =>{
                  for(var i in data.data){
                    let  j = data.data[i]
                    dict[j[1]] = [j[5],j[13],j[16]];
                  }
                  req.choroplethData = dict;
                  req.dataLoaded = true;
                  req.setState({});
                  req.leafletMap.current.invalidateSize();
              })      
          });
    
    
  }

  render() {
    return (
      <div className="mapdiv" id="transformOnChange" style={{width: '100vw'}}> 
        <MapContainer style={{height: "90vh", width: 'inherit', background:"transparent"}} 
                      zoom={4.8} center={[40, -95.83]} zoomDelta={0.33} zoomSnap={0} minZoom={4.6}
                      maxBounds={this.bounds}
                      whenCreated={ mapInstance => { this.leafletMap.current = mapInstance } }>
          {this.dataLoaded ?
          <LayersControl position="topleft">
            <LayersControl.BaseLayer checked name="Default view">
              <LayerGroup>
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
              </LayerGroup>
              
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Vaccinations">
              <LayerGroup>
                  <GeoJSON 
                    style={this.vaccinationStyle}
                    data={countyData.features}
                    onEachFeature={this.onEachFeature}
                    />
                  <GeoJSON 
                    style={this.stateStyle}
                    data={statesData.features}
                    interactive={false}
                  />
              </LayerGroup>
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Cases">
              <LayerGroup>
                  <GeoJSON 
                    style={this.caseStyle}
                    data={countyData.features}
                    onEachFeature={this.onEachFeature}
                    />
                  <GeoJSON 
                    style={this.stateStyle}
                    data={statesData.features}
                    interactive={false}
                  />
              </LayerGroup>
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Deaths">
              <LayerGroup>
                  <GeoJSON 
                    style={this.deathStyle}
                    data={countyData.features}
                    onEachFeature={this.onEachFeature}
                    />
                  <GeoJSON 
                    style={this.stateStyle}
                    data={statesData.features}
                    interactive={false}
                  />
              </LayerGroup>
            </LayersControl.BaseLayer>
            
          </LayersControl>
          : null}


          
        </MapContainer>
      </div>
    );
  }
}

export default Map;