import React from "react";

class SideBar extends React.Component {
    /*
        TODO
            Implement the retrevial of data
            Allow for closing the sidebar
    */
    constructor(props) {
        super(props)

        this.getData = this.getData.bind(this)
    }

    async getData(){
        // call api endpoint 4F5D75
    }

    render () {

        return(
            <div className="sidebar">
                <h1 className="sidebarHeading"> {this.props.countyName} </h1>
            </div>
        );
    }
}

export default SideBar;