## Getting started
To run the node server, execute `npm install` then `node index.js`. Place all static files such as ones generated from a React project into a folder named `static`. Visit [https://localhost:3000](https://localhost:3072) to view the website.

## API Endpoints
`/api/getdata` - Accepts `start` and `end` field queries, as UNIX milliseconds. Will return a list of arrays with dates between(inclusive) the start and end. For example, `/api/getdata?start=1628049600000&end=1628136000000` could return 
```json
{"data":[[1628049600000,"01001","Autauga County","AL","Alabama","279.225",25.51653,"high",24.9,13900,13900,29.2,13447,31.3,4633,51.9],...],"headers":["date","fips_code","county_name","state","state_name","cases","positive_pct","severity","complete","complete_pct","complete_12","complete_12_pct","complete_18","complete_18_pct","complete_65","complete_65_pct"]}
```

## More
The server will automatically fetch COVID data from the [CDC Vaccinations in the US Counties](https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh) and [CDC Level of Transmission in the US Counties](https://data.cdc.gov/Public-Health-Surveillance/United-States-COVID-19-County-Level-of-Community-T/nra9-vzzn). It updates the databases once each day.