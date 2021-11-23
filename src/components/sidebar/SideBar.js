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

    render () {
        if (this.props.isOpen) {
            if (this.props.countyName) {
                return(
                    <div className="sidebarOpen">
                        <button onClick={this.props.toggleSidebar} className="sidebarHide">Hide Sidebar</button>
                        <h1 className="sidebarHeading"> {this.props.countyName} </h1>
                        <h2 className="sidebarDetails">Cases: {this.props.cases}</h2>
                        <h2 className="sidebarDetails">Positivity (%): {this.props.positivity}</h2>
                        <h2 className="sidebarDetails">Severity: {this.props.severity}</h2>
                        <h2 className="sidebarDetails">Vaccination (%): {this.props.vaccinations}</h2>
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