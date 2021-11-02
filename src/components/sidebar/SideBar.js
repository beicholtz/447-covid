import React from "react";

class SideBar extends React.Component {
    constructor(props) {
        super(props)
    }


    render () {

        return(
            <div>
                <h1> {this.props.countyName} </h1>
            </div>
        );
    }
}

export default SideBar;