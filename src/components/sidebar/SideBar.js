import React from "react";

class SideBar extends React.Component {
    constructor(props) {
        super(props)

        this.getData = this.getData.bind(this)
    }

    async getData(){
        // call api endpoint
    }

    render () {

        return(
            <div className="sidebar">
                <h1> {this.props.countyName} </h1>
            </div>
        );
    }
}

export default SideBar;