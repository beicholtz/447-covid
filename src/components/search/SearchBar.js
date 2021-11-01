import React from "react";
import autoComplete from "@tarekraafat/autocomplete.js/dist/autoComplete";
import AutocompleteWords from './autocomplete.json';

class SearchBar extends React.Component {

    async handleSubmit(event) {
        event.preventDefault();
        console.log('hi');
        // await fetch('/api/updateUser', {
        //     method: 'POST',
        //     body: JSON.stringify(this.state)
        // }).then(function(response){
        //     return response.json();
        // });
        
        event.target.reset();
    }

    componentDidMount(){
        const autoCompleteJS = new autoComplete({
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
                        autoCompleteJS.input.value = selection;
                    }
                }
            },
        });
    }

    render () {
        return(
            <div class='searchbar'>
                <form onSubmit={this.handleSubmit}> 
                    <input id="autoComplete" />
                </form>
            </div> 
        );
  
    }
  }

export default SearchBar