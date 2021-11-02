import './App.css';
import Map from './components/map/Map';
import SearchBar from './components/search/SearchBar';
import SideBar from './components/sidebar/SideBar'
import React from "react";

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        selectedCounty : 0,
        selectedCountyFIPS : 0
    };
    this.updateCounty = this.updateCounty.bind(this);
}
  
  async updateCounty(id){
    this.setState({
      selectedCounty : id[0],
      selectedCountyFIPS : id[1]
    });
  //   await fetch('/api/getData/' + id, {
  //     method: 'get',
  //     body: JSON.stringify(id)
  // }).then(function(response){
  //     return response.json();
  // });
  }

  render () {
      return(
        <div>
          <SearchBar handler={this.updateCounty}/>
          <Map/>
          <SideBar countyName={this.state.selectedCounty} />
        </div>
      );

  }
}
export default App;
