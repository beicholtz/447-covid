import './App.css';
import Map from './components/map/Map';
import SearchBar from './components/search/SearchBar';
import React from "react";

class App extends React.Component {


  render () {
      return(
        <div>
          <SearchBar />
          <Map />
        </div>
      );

  }
}
export default App;
