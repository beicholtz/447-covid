import './App.css';
import Map from './components/map/Map';
import SearchBar from './components/search/SearchBar';
import React from "react";

class App extends React.Component {

  async openSide() {
    document.getElementById("sidebar").style.width = "25%";
  }

  async closeSide() {
    document.getElementById("sidebar").style.width = "0";
  }

  render () {
      return(
        <div>
          <SearchBar />
          {/* Left Info Text */}
          <div className="leftpad">Team 11 Coronavirus Map Project
            <p>
                This is the map that displays the covid-19 infection and vaccination
                rate for the US counties. First select a state to view that state's
                and then select a county to view that's counties data.
            </p>
            <button onClick={this.openSide}>Open Sidebar</button>
          </div>
          {/* Container for easier control of leaflet map location */}
          <div class="map-container">
            <Map />
          </div>
          {/* Sidebar to display data */}
          <div id="sidebar" className="sidebar">
            <div>
              <button onClick={this.closeSide}>Close</button>
              <p>Testing</p>
            </div>
          </div>
          
        </div>
      );

  }
}
export default App;
