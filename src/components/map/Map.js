import * as L from 'leaflet';
import {MapContainer, GeoJSON, useMap} from 'react-leaflet';
import countyData from './mapData.json';
import "leaflet/dist/leaflet.css";
import statesData from './states.json';
import React from 'react';

function Map() {

  var chosenState;
  var bounds = L.latLngBounds(L.latLng(51,-131), L.latLng(17,-64));

  const countyStyle = {
    fillColor: '#EC6A32',
    weight: 1,
    opacity: 1,
    color: 'black',
    fillOpacity: 1
  }

  const stateStyle = {
    fillColor: '#BFC0C0',
    fillOpacity: 1.0,
    color: 'black',
    weight: 1,
    opacity: 1,
  }

  function onEachFeature(feature, layer){
    if(feature.properties && feature.properties.STATE){
      let value = feature.properties.NAME + " " + feature.properties.COUNTY;
      layer.bindPopup(value);
    }
  }

  function removeCounties(map){
    if(chosenState){
      map.removeLayer(chosenState);
    }
  }

  function stateClicked(e, feature, map){
    var stateSpecific = {"type": "FeatureCollection", "features":[]};
    for(var i = 0; i < countyData.features.length; i++){
      if(countyData.features[i].properties.STATE === feature.properties.STATE){
        stateSpecific.features.push(countyData.features[i]);
      }
    }
    
    removeCounties(map);
    
    chosenState = L.geoJSON(stateSpecific.features, {style: countyStyle, onEachFeature: onEachFeature});

    map.addLayer(chosenState);
  }

  function ShowCounties(feature, layer){
    const map = useMap();
    layer.on({
      mouseover: function(e){ stateClicked(e, feature, map);},
    });

  }

  return (
    <div class="mapdiv"> 
      <MapContainer style={{height: "inherit", width: "inherit", background:"transparent"}} 
                    zoom={4.8} center={[35, -95.83]} zoomDelta={0.33} zoomSnap={0} minZoom={4.6}
                    maxBounds={bounds}>
        <GeoJSON 
          style={stateStyle}
          data={statesData.features}
          onEachFeature={ShowCounties}
        />
      </MapContainer>
    </div>
  );
}

export default Map;