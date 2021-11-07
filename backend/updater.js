const https = require( 'https' );
const sqlite3 = require( 'sqlite3' ).verbose();
const statik = require( 'node-static' );
const schedule = require( 'node-schedule' );

const db = new sqlite3.Database( './covidData.db' );

console.log( "Starting update scheduler" );
schedule.scheduleJob( '4 0 0 * * *', ( date ) => {
  date.setUTCHours( 0 );
  date.setDate( date.getDate() - 1 );
  let dateStr = date.toISOString.slice( 0, -1 );
  console.log( "Updating vaccination and transmission data..." );
  https.get( `https://data.cdc.gov/resource/8xkx-amqh.json?date=${ dateStr }`, ( res ) => {
    let content = "";

    res.on( "data", ( chunk ) => {
      content += chunk;
    } );

    res.on( "end", () => {
      let data = JSON.parse( content );
      db.serialize( () => {
        let statement = db.prepare( "INSERT INTO vaccinations VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )" );
        for ( let i = 0; i < data.length; i++ ) {
          let row = data[ i ];
          statement.run( [ dateStr, row.fips, row.recip_county, row.recip_state, row.series_complete_yes, row.completeness_pct, row.series_complete_12plus, row.series_complete_12pluspop, row.series_complete_18plus, row.series_complete_18pluspop, row.series_complete_65plus, row.series_complete_65pluspop ] );
        }
        statement.finalize();
      } );
    } );
  } );

  https.get( `https://data.cdc.gov/resource/nra9-vzzn.json?date=${ dateStr }`, ( res ) => {
    let content = "";

    res.on( "data", ( chunk ) => {
      content += chunk;
    } );

    res.on( "end", () => {
      let data = JSON.parse( content );
      db.serialize( () => {
        let statement = db.prepare( "INSERT INTO transmissions VALUES ( ?, ?, ?, ?, ?, ?, ? )" );
        for ( let i = 0; i < data.length; i++ ) {
          let row = data[ i ];
          statement.run( [ dateStr, row.fips_code, row.county_name, row.state_name, row.cases_per_100k_7_day_count, row.percent_test_results_reported, row.community_transmission_level ] );
        }
        statement.finalize();
      } );
    } );
  } );
} );