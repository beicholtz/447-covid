/*import './App.css';
import Map from './components/map/Map';
import SearchBar from './components/search/SearchBar';
import SideBar from './components/sidebar/SideBar'
import React, { useState } from "react";
import Toggler from './components/ToggleTheme/toggler'; 



class App extends React.Component {

  async handleViewSidebar() {
    this.setState({sidebarOpen: !this.state.sidebarOpen});
  }
  
  constructor(props) {
    super(props)
    this.state = {
        selectedCounty : 0,
        cases : 0,
        positive_pct : 0,
        severity : 0,
        complete : 0,
        isToggled: true,
        sidebarOpen : false,
    };
    this.updateCounty = this.updateCounty.bind(this);
    this.toggleLightDark = this.toggleLightDark.bind(this);
    this.updateCounty = this.updateCounty.bind(this);
    this.handleViewSidebar = this.handleViewSidebar.bind(this);
  }
  
  async updateCounty(id){
    let req = this;
    this.setState({sidebarOpen: true});
    await fetch('http://localhost:3072/api/getdata?start=0&end=16281360000000&fips=' + id[1], {
            method: 'GET'
        }).then(function(response){
            let a;
            response.json().then(data =>{
                a = data
                req.setState({
                  selectedCounty : id[0],
                  cases : a.data[0][5],
                  positive_pct : a.data[0][6],
                  severity : a.data[0][7],
                  complete : a.data[0][8],
                });
            })
        });

        
    
  }

  getLightOrDark() {
    if (this.state.isToggled) {
      
      return("dark-mode");
    }
    else {
      return("light-mode")
    }
  }

  toggleLightDark() { 
    this.setState(prevState => ({
      isToggled : !prevState.isToggled }));
  };


  render () {
      return(
        <div className={this.getLightOrDark()}>  
               
          <SearchBar handler={this.updateCounty}/> 
          <div className="container"> 
            <Map handler={this.updateCounty} update={this.state.selectedCounty ? true : false}/>
            
          
            <SideBar countyName={this.state.selectedCounty} cases={this.state.cases} positivity={this.state.positive_pct} severity={this.state.severity} vaccinations={this.state.complete} />
            
            

          
          </div>
          <Toggler rounded={true} onToggle={this.toggleLightDark}/>  
          
        </div>
      );

  }
}
export default App;
*/

import './App.css';
import Map from './components/map/Map';
import SearchBar from './components/search/SearchBar';
import SideBar from './components/sidebar/SideBar'
import React from "react";

class App extends React.Component {

  async handleViewSidebar() {
    this.setState({sidebarOpen: !this.state.sidebarOpen});
  }
  
  constructor(props) {
    super(props)
    this.state = {
        selectedCounty : 0,
        cases : 0,
        positive_pct : 0,
        severity : 0,
        complete : 0,
        date : 0,
        isToggled : false,
        sidebarOpen : false,
    };
    this.updateCounty = this.updateCounty.bind(this);
    this.handleViewSidebar = this.handleViewSidebar.bind(this);
    this.toggleLightDark = this.toggleLightDark.bind(this);

  }
  
  async updateCounty(id){
    let req = this;
    if (id[1] !== undefined) {
      document.getElementById("alert").style.display = "none";
      this.setState({sidebarOpen: true});
      await fetch('http://localhost:3072/api/getdata?start=0&end=16281360000000&fips=' + id[1], {
              method: 'GET'
          }).then(function(response){
              let a;
              response.json().then(data =>{
                  a = data;
                  if (a.data[0] !== undefined) {
                    req.setState({
                      selectedCounty : id[0],
                      cases : a.data[0][5],
                      positive_pct : a.data[0][6],
                      severity : a.data[0][7],
                      complete : a.data[0][8],
                      date : a.data[0][0]
                    });
                  } else {
                    req.setState({
                      selectedCounty : id[0],
                      cases : "Unavailable",
                      positive_pct : "Unavailable",
                      severity : "Unavailable",
                      complete : "Unavailable",
                      date : "Unavailable"
                    });
                  }
              })
          });
    } else {
      document.getElementById("alert").style.display = "block";
    }
  }
        
  getLightOrDark() {
    if (this.state.isToggled) {
      return("dark-mode");
    }
    else {
      return("light-mode")
    }
  };

  toggleLightDark() { 
    this.setState(prevState => ({
      isToggled : !prevState.isToggled }));
  };

  closeAlert() {
    document.getElementById("alert").style.display = "none";
  }

  render () {
      return(
        <div className={this.getLightOrDark()}>          
          <div className="alert" id="alert" hidden>
            <span className="closebtn" onClick={this.closeAlert}>&times;</span> 
            <strong>Invalid Input</strong> Input must match autocomplete options (case sensitive).
          </div>
          <SearchBar handler={this.updateCounty} lightdark={this.toggleLightDark}/>
          <div className="container"> 
            <Map handler={this.updateCounty} update={this.state.selectedCounty ? true : false}/>
            <SideBar date={this.state.date} countyName={this.state.selectedCounty} cases={this.state.cases} positivity={this.state.positive_pct} severity={this.state.severity} vaccinations={this.state.complete} isOpen={this.state.sidebarOpen} toggleSidebar={this.handleViewSidebar}/>
          </div>
        </div>
      );
  }
}

export default App;