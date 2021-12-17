import './App.css';
import Map from './components/map/Map';
import SearchBar from './components/search/SearchBar';
import SideBar from './components/sidebar/SideBar'
import React from "react";
import moment from 'moment'; 

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
        deaths : 0,
        date : 0,
        isToggled : false,
        sidebarOpen : false,
    };
    this.SingleDate = React.createRef();
    this.RangeDates = React.createRef();
    this.updateCounty = this.updateCounty.bind(this);
    this.handleViewSidebar = this.handleViewSidebar.bind(this);
    this.toggleLightDark = this.toggleLightDark.bind(this);
    this.selectedDate = moment().subtract(1, 'days').format("YYYY-MM-DD")
  }
  
  async updateCounty(id){
    let req = this;
    if (id[1] !== undefined) {
      document.getElementById("alert").style.display = "none";
      this.setState({sidebarOpen: true});
      await fetch('http://localhost:3072/api/getdata?start=' + this.selectedDate + '&end=' + this.selectedDate + '&fips=' + id[1], {
              method: 'GET'
          }).then(function(response){
              let a;
              response.json().then(data =>{
                  a = data;
                  if (a.data[0] !== undefined) {
                    req.setState({
                      selectedCounty : id[0],
                      cases : a.data[0][12],
                      positive_pct : a.data[0][5],
                      severity : a.data[0][7],
                      complete : a.data[0][8],
                      deaths : a.data[0][15],
                      date : a.data[0][0]
                    });
                  } else {
                    req.setState({
                      selectedCounty : id[0],
                      cases : "Unavailable",
                      positive_pct : "Unavailable",
                      severity : "Unavailable",
                      complete : "Unavailable",
                      deaths : "Unavailable", 
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

  getRangeDates = (startDate, endDate) => {
    var startDateFormatted = [moment(startDate).date(), moment(startDate).month() + 1, moment(startDate).year()];
    var endDateFormatted = [moment(endDate).date(), moment(endDate).month() + 1, moment(endDate).year()];
    alert([[startDateFormatted, endDateFormatted]])
    return([startDateFormatted, endDateFormatted])
  }

  getSingleDate = (singleDate) => {
    var singleDateFormatted = [moment(singleDate).date(), moment(singleDate).month() + 1, moment(singleDate).year()];
    // alert(singleDateFormatted);
    this.selectedDate = moment(singleDate).format("YYYY-MM-DD");
    return(singleDateFormatted)
  }

  render () 
   {
      return(
        <div className={this.getLightOrDark()}>  
          <div className="alert" id="alert" hidden>
            <span className="closebtn" onClick={this.closeAlert}>&times;</span> 
            <strong>Invalid Input</strong> Input must match autocomplete options (case sensitive).
          </div>
          <SearchBar 
            ref={this.SingleDate}
            handler={this.updateCounty} 
            lightdark={this.toggleLightDark} 
            getSingleDate={this.getSingleDate}
          />
          <div className="container"> 
            <Map 
                handler={this.updateCounty} 
                update={this.state.selectedCounty ? true : false} 
                shiftLeft={this.state.sidebarOpen}
            />
            <SideBar 
              ref={this.RangeDates}
              date={this.state.date} 
              countyName={this.state.selectedCounty} 
              cases={this.state.cases}
              deaths={this.state.deaths}
              positivity={this.state.positive_pct} 
              severity={this.state.severity} 
              vaccinations={this.state.complete} 
              isOpen={this.state.sidebarOpen} 
              toggleSidebar={this.handleViewSidebar} 
              getRangeDates={this.getRangeDates}
              />
          </div>
        </div>
      );
  }
}

export default App;