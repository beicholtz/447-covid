import React from "react";

class SideBar extends React.Component {
    /*
        TODO
            Allow for closing the sidebar
    */
    constructor(props) {
        super(props)

    }

    render () {

        return(
            <div className="sidebar">
                <h1 className="sidebarHeading"> {this.props.countyName} </h1>
                <h2 className="sidebarDetails">Cases: {this.props.cases}</h2>
                <h2 className="sidebarDetails">Positivity (%): {this.props.positivity}</h2>
                <h2 className="sidebarDetails">Severity: {this.props.severity}</h2>
                <h2 className="sidebarDetails">Vaccination (%): {this.props.vaccinations}</h2>
            </div>
        );
    }
}

export default SideBar;