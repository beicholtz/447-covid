import React from "react";

class SideBar extends React.Component {
    /*
        TODO
            Allow for closing the sidebar
    */
    constructor(props) {
        super(props)
    }

    toggleSidebar () {
        this.setState({sidebarOpen: !this.state.sidebarOpen});
    }

    convertDate() {
        if (this.props.date === "Unavailable")
            return "Unavailable"
        var date = new Date(this.props.date);
        var year = date.getFullYear();
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);
        return month + "/" + day + "/" + year;
    }

    render () {
        if (this.props.isOpen) {
            if (this.props.countyName) {
                return(
                    <div className="sidebarOpen">
                        <button type="button" onClick={this.props.toggleSidebar} className="sidebarHide">Hide Sidebar</button>
                        <h1 className="sidebarHeading"> {this.props.countyName} </h1>
                        <h2 className="sidebarDetails">
                            Date: {this.convertDate()}<br/>
                            Cases: {this.props.cases}<br/> 
                            Population Positive: {this.props.positivity}% <br />
                            Severity: {this.props.severity}<br />
                            Population Vaccinated: {this.props.vaccinations}%
                        </h2>
                    </div>
                );
            } else {
                return(
                    <div className="sidebarOpen">
                        <button onClick={this.props.toggleSidebar} className="sidebarHide">Hide Sidebar</button>
                        <h1 className="sidebarHeading">Select a county to get started!</h1>
                    </div>
                )
            }
        } else {
            return(
                <div className="sidebarClosed">
                    <button onClick={this.props.toggleSidebar} className="sidebarShow">Show Sidebar</button>
                </div>
            )
        }
    }
}

export default SideBar;