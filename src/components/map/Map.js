import * as L from 'leaflet';
import {MapContainer, GeoJSON} from 'react-leaflet'; //useMap
import countyData from './mapData.json';
import "leaflet/dist/leaflet.css";
import statesData from './states.json';
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
      fillColor: '#BFC0C0',
      fillOpacity: 1.0,
      color: 'black',
      weight: 1,
      opacity: 1,
    }

    this.leafletMap = React.createRef();
    this.chosenState = undefined
    this.bounds = L.latLngBounds(L.latLng(51,-131), L.latLng(17,-64))
    // this.componentDidMount = this.componentDidMount.bind(this);
  }

  onEachFeature(feature, layer){
    if(feature.properties && feature.properties.STATE){
      let value = feature.properties.NAME + " " + feature.properties.COUNTY;
      layer.bindPopup(value);
    }
  }

  removeCounties(){
    if(this.chosenState){
      this.leafletMap.current.removeLayer(this.chosenState);
    }
  }

  stateClicked = (feature) => {
    var stateSpecific = {"type": "FeatureCollection", "features":[]};
    for(var i = 0; i < countyData.features.length; i++){
      if(countyData.features[i].properties.STATE === feature.properties.STATE){
        stateSpecific.features.push(countyData.features[i]);
      }
    }
    
    this.removeCounties(this.leafletMap);
    
    this.chosenState = L.geoJSON(stateSpecific.features, {style: this.countyStyle, onEachFeature: this.onEachFeature});

    this.leafletMap.current.addLayer(this.chosenState);
  }

  showCounties = (feature, layer) =>{
    // console.log('hi')
    layer.on({
      mouseover: () => this.stateClicked(feature),
    });

  }

  render() {
    return (
      <div className="mapdiv" style={{width: 'inherit'}}> 
        <MapContainer style={{height: "90vh", width: 'inherit', background:"transparent"}} 
                      zoom={4.8} center={[35, -95.83]} zoomDelta={0.33} zoomSnap={0} minZoom={4.6}
                      maxBounds={this.bounds}
                      whenCreated={ mapInstance => { this.leafletMap.current = mapInstance } }>
          <GeoJSON 
            style={this.stateStyle}
            data={statesData.features}
            onEachFeature={this.showCounties}
          />
        </MapContainer>
      </div>
    );
  }


}

// function Map(shouldUpdate) {

//   var leafletMap;
//   var chosenState;
//   var bounds = L.latLngBounds(L.latLng(51,-131), L.latLng(17,-64));

//   const countyStyle = {
//     fillColor: '#EC6A32',
//     weight: 1,
//     opacity: 1,
//     color: 'black',
//     fillOpacity: 1
//   }

//   const stateStyle = {
//     fillColor: '#BFC0C0',
//     fillOpacity: 1.0,
//     color: 'black',
//     weight: 1,
//     opacity: 1,
//   }

//   function onEachFeature(feature, layer){
//     if(feature.properties && feature.properties.STATE){
//       let value = feature.properties.NAME + " " + feature.properties.COUNTY;
//       layer.bindPopup(value);
//     }
//   }

//   function removeCounties(map){
//     if(chosenState){
//       map.removeLayer(chosenState);
//     }
//   }

//   function stateClicked(e, feature, map){
//     var stateSpecific = {"type": "FeatureCollection", "features":[]};
//     for(var i = 0; i < countyData.features.length; i++){
//       if(countyData.features[i].properties.STATE === feature.properties.STATE){
//         stateSpecific.features.push(countyData.features[i]);
//       }
//     }
    
//     removeCounties(map);
    
//     chosenState = L.geoJSON(stateSpecific.features, {style: countyStyle, onEachFeature: onEachFeature});

//     map.addLayer(chosenState);
//   }

//   function ShowCounties(feature, layer){
//     const map = useMap();
//     layer.on({
//       mouseover: function(e){ stateClicked(e, feature, map);},
//     });

//   }

//   if(shouldUpdate){
//     leafletMap.invalidateSize()
//   }

//   return (
//     <div className="mapdiv" style={{width: 'inherit'}}> 
//       <MapContainer style={{height: "90vh", width: 'inherit', background:"transparent"}} 
//                     zoom={4.8} center={[35, -95.83]} zoomDelta={0.33} zoomSnap={0} minZoom={4.6}
//                     maxBounds={bounds}
//                     ref={function(){leafletMap = map.leafletElement}}>
//         <GeoJSON 
//           style={stateStyle}
//           data={statesData.features}
//           onEachFeature={ShowCounties}
//         />
//       </MapContainer>
//     </div>
//   );
// }

export default Map;