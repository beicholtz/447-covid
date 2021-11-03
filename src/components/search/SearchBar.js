import React from "react";
import autoComplete from "@tarekraafat/autocomplete.js/dist/autoComplete";
import AutocompleteWords from './autocomplete.json';
import relationalData from './relational.json';

class SearchBar extends React.Component {

    /*
        TODO: 
            QOL make it so when the user selects a county from the dropdown it automatically submits the form
            On the same note when the user uses the arrow keys the search bar should auto populate the data they are hovering  
    */

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.autoCompleteJS = undefined;
    }

    /*
        when the form is submitted the data is passed to the sidebar
    */ 
    async handleSubmit(event) {
        event.preventDefault();
        this.props.handler([this.autoCompleteJS.input.value, relationalData[this.autoCompleteJS.input.value]]);
        event.target.reset();
    }

    /*
        Called when the component is created, and performs the initial set-up for autocomplete to work.
    */
    componentDidMount(){
        this.autoCompleteJS = new autoComplete({
            placeHolder: "Search for Counties",
            submit: true,
            data: {
                src: AutocompleteWords.features,
                cache: false
            },
            resultItem: {
                highlight: {
                    render: true
                }
            },
            events: {
                input: {
                    selection: (event) => {
                        const selection = event.detail.selection.value;
                        this.autoCompleteJS.input.value = selection;
                    }
                }
            },
        });
    }

    render () {
        return(
            <div className='searchbar'>
                <form onSubmit={this.handleSubmit}> 
                    <input id="autoComplete" name='county' />
                </form>
            </div> 
        );
  
    }
  }

export default SearchBar