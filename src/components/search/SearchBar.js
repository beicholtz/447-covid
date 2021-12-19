import React from "react";
import autoComplete from "@tarekraafat/autocomplete.js/dist/autoComplete";
import AutocompleteWords from './autocomplete.json';
import relationalData from './relational.json';
import Toggler from "../ToggleTheme/toggler";
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker} from 'react-dates';
import moment from 'moment';

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.autoCompleteJS = undefined;
        this.state = {
            singleDate: moment().subtract(1, 'days'),
            minDate: moment("2020-01-21", "YYYY-MM-DD"),
            maxDate: moment(),
            focused: false,
        }
        this.onFocusChange = this.onFocusChange.bind(this);
    };

    /*
        when the form is submitted the data is passed to the sidebar
    */
    async handleSubmit(event) {
        console.log(relationalData[this.autoCompleteJS.input.value]);
        event.preventDefault();
        this.props.handler([this.autoCompleteJS.input.value, relationalData[this.autoCompleteJS.input.value]]);
        event.target.reset();
    }

    /*
        Called when the component is created, and performs the initial set-up for autocomplete to work.
    */
    async componentDidMount() {
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
                        if (event.detail.event.type === "click") {
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

    onFocusChange() {
        this.setState({ focused: !this.state.focused });

    }

    componentDidUpdate(prevProps) {
        const { focused, singleDate } = this.state;
        if (!focused && singleDate) {
            this.props.getSingleDate(singleDate)
        }
    }

    changeDate(singleDate) {
        if (singleDate !== undefined && singleDate !== null)
            document.getElementById("dateText").innerHTML = singleDate.format("MM/DD/YYYY")
    }

    render() {
        return (
            <div className='searchbar'>
                <Toggler rounded={true} onToggle={this.props.lightdark} />
                <form id="searchForm" onSubmit={this.handleSubmit} autoComplete="off">
                    <input className='searchBox' id="autoComplete" name='county' />
                </form>
                <div className="singleDate">
                    <SingleDatePicker
                        date={this.state.singleDate} // momentPropTypes.momentObj or null
                        onDateChange={singleDate => this.setState({ singleDate }, this.changeDate(singleDate))} // PropTypes.func.isRequired
                        focused={this.state.focused} // PropTypes.bool
                        onFocusChange={this.onFocusChange} // PropTypes.func.isRequired
                        id="your_unique_id" // PropTypes.string.isRequired,
                        isOutsideRange={date => date.isBefore(this.state.minDate) || date.isAfter(this.state.maxDate)}
                    />
                    <div className="dateTextSlot">
                        Selected Date: <p className="dateText" id="dateText">{moment().subtract(1, 'days').format("MM/DD/YYYY")}</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default SearchBar