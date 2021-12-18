import React from "react";
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import moment from "moment";

class SideBar extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            startDate: null,
            endDate: null,
            minDate: moment("2020-01-21", "YYYY-MM-DD"),
            maxDate: moment(),
            focusedInput: false,
        }
    }

    toggleSidebar () {
        this.setState({sidebarOpen: !this.state.sidebarOpen});
    }

    convertDate() {
        if (this.props.date === "Unavailable")
            return "Unavailable"
        var date = String(this.props.date).split("-")
        var year = date[0]
        var month = date[1]
        var day = date[2]
        return month + "/" + day + "/" + year;
    }

    componentDidUpdate(prevProps) {
        const {focusedInput, startDate, endDate} = this.state;
        if (!focusedInput && (startDate && endDate)) {
            this.props.getRangeDates(startDate, endDate)
        }
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
                            Deaths: {this.props.deaths}<br/>
                            Population Vaccinated: {this.props.vaccinations}%
                        </h2>
                        <br></br>
                        <h2 className="sidebarDetails">
                            See Date Range Statistics
                        </h2>
                        <div className = "rangeDate">
                            <DateRangePicker
                                startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                                startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                                endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                                endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                                onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
                                focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                                isOutsideRange={date => date.isBefore(this.state.minDate) || date.isAfter(this.state.maxDate)}
                                />
                        </div>
                        
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