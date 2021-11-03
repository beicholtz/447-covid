import React from "react";
import autoComplete from "@tarekraafat/autocomplete.js/dist/autoComplete";
import AutocompleteWords from './autocomplete.json';
import relationalData from './relational.json';

class SearchBar extends React.Component {

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
        console.log(this.autoCompleteJS.input.value);
        event.preventDefault();
        this.props.handler([this.autoCompleteJS.input.value, relationalData[this.autoCompleteJS.input.value]]);
        event.target.reset();
    }

    /*
        Called when the component is created, and performs the initial set-up for autocomplete to work.
    */
    async componentDidMount(){
        this.autoCompleteJS = new autoComplete({
            placeHolder: "Search for a county",
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
                        if(event.detail.event.type === "click"){
                            event.preventDefault();
                            this.props.handler([this.autoCompleteJS.input.value, relationalData[this.autoCompleteJS.input.value]]);
                            this.autoCompleteJS.input.value = ''
                        }
                        
                    },
                    navigate: (event) => {
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
                <form id="searchForm" onSubmit={this.handleSubmit}> 
                    <input id="autoComplete" name='county' />
                </form>
            </div> 
        );
  
    }
  }

export default SearchBar