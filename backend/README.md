## Getting started
To run the node server, execute `npm install` then `node index.js`. Place all static files such as ones generated from a React project into a folder named `static`. Visit [https://localhost:3072](https://localhost:3072) to view the website.

## Updating data
Vaccination data can be downloaded from [https://data.cdc.gov/resource/8xkx-amqh.csv](https://data.cdc.gov/resource/8xkx-amqh.csv) and placed in the same directory as the `index.js` file, renamed as `vaccination-data.csv`. Additionally, the `us-counties-20XX.csv` files can be downloaded from [here](https://github.com/nytimes/covid-19-data/tree/master/rolling-averages) and placed in the same directory as well. If the `covidData.db` file isn't detected on startup, it will check for local files, but will download from the corresponding websites if not found. To update easily, stop the server, remove all local csv files and the `covidData.db` file, and restart the server.

## API Endpoints
`/api/getdata` - Accepts `start` and `end` field queries, in IS) 8601 date format. Also accepts an optional `fips` field query. Will return a list of arrays with dates between(inclusive) the start and end. For example, `/api/getdata?start=2021-12-11&end=2021-12-11&fips=78010` could return 
```json
{"data":[["2021-12-11","78010","St. Croix","Virgin Islands","VI",0,20519,0,19504,0,6138,0,0,6.57,12.99,0,0,0],["2021-12-11","78010","St. Croix","Virgin Islands","VI",0,20519,0,19504,0,6138,0,0,6.57,12.99,0,0,0]],"headers":["date","fips","county_name","state_name","state","complete_pct","complete_12","complete_12_pct","complete_18","complete_18_pct","complete_65","complete_65_pct","cases","cases_avg","case_avg_per_100k","deaths","deaths_avg","deaths_avg_per_100k"]}
```
Omitting the `fips` field query will include all counties in the specified date range.