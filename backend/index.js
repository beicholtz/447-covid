const http = require( 'http' );
const https = require( 'https' );
const sqlite3 = require( 'sqlite3' ).verbose();
const statik = require( 'node-static' );
const qs = require( 'querystring' );
const fs = require( 'fs' );
const schedule = require( 'node-schedule' );

const HOSTNAME = '0.0.0.0';
const PORT = 3072;

const db = new sqlite3.Database( ':memory:' );

db.serialize( () => {
  db.run( "CREATE TABLE vaccinations ( date BIGINT, fips TEXT, name TEXT, state TEXT, complete INT, complete_pct FLOAT, complete_12 INT, complete_12_pct FLOAT, complete_18 INT, complete_18_pct FLOAT, complete_65 INT, complete_65_pct FLOAT )" );
  db.run( "CREATE TABLE transmissions ( date BIGINT, fips TEXT, name TEXT, state_name TEXT, cases TEXT, positive FLOAT, severity TEXT )" )
} );

console.log( "Downloading transmission data..." );
https.get( "https://data.cdc.gov/api/views/nra9-vzzn/rows.json", ( res ) => {
  let body = "";

  res.on( "data", ( chunk ) => {
    body += chunk;
  } );

  res.on( "end", () => {
    console.log( "Parsing transmission data..." );
    let data = JSON.parse( body ).data;
    // Load it into the database
    console.log( `Inserting transmission data(${ data.length } entries)...` );
    db.serialize( () => {
      let statement = db.prepare( "INSERT INTO transmissions VALUES ( ?, ?, ?, ?, ?, ?, ? )" );
      for ( let i = 0; i < data.length; i++ ) {
        let row = data[ i ];
        let date = new Date( row[ 11 ] );
        date.setUTCHours( 0 );
        date.setMinutes( 0 );
        date.setSeconds( 0 );
        date.setMilliseconds( 0 );
        statement.run( [ date.getTime(), row[ 10 ], row[ 9 ], row[ 8 ], row[ 12 ], row[ 13 ], row[ 14 ] ] );
      }
      statement.finalize();
    } );

    console.log( "Done parsing transmission data" );
  } )
} ).on( "error", ( e ) => {
  console.error( e );
} );

console.log( "Downloading vaccination data..." );
https.get( "https://data.cdc.gov/api/views/8xkx-amqh/rows.json", ( res ) => {
  let vaccinationBody = "";

  res.on( "data", ( chunk ) => {
    vaccinationBody += chunk;
  } );

  res.on( "end", () => {
    console.log( "Parsing vaccination data..." );
    let data = JSON.parse( vaccinationBody ).data;

    console.log( `Inserting vaccination data(${ data.length } entries)...` );
    db.serialize( () => {
      let statement = db.prepare( "INSERT INTO vaccinations VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )" );
      for ( let i = 0; i < data.length; i++ ) {
        let slice = data[ i ].slice( 8, 10 );
        let date = new Date( slice[ 0 ] );
        date.setUTCHours( 0 );
        date.setMinutes( 0 );
        date.setSeconds( 0 );
        date.setMilliseconds( 0 );
        slice[ 0 ] = date.getTime();
        statement.run( slice.concat( data[ i ].slice( 11, 21 ) ) );
      }
      statement.finalize();
    } );

    console.log( "Done parsing vaccination data" )
  } );
} ).on( "error", ( e ) => {
  console.error( e );
} );

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

function isPositiveInteger( val ) {
  return val && val.match( /^([0-9]+)$/ );
}

const fileServer = new statik.Server( './static' );
const server = http.createServer( ( req, res ) => {
  let content = '';

  req.addListener( 'data', ( data ) => {
    content += data;

    if ( content.length > 1e6 ) {
      req.connection.destroy();
    }
  } );

  req.addListener( 'end', () => {
    let urlPart = req.url.split( '?' );
    let queries = urlPart.length > 1 ? decodeURIComponent( urlPart[ 1 ] ) : "";
    let path = urlPart[ 0 ];
    let method = req.method;

    if ( path === "/api/getdata" && method == "GET" ) {
      let query = qs.parse( queries );
      // Parse the time ranges and return the appropriate data, or return an error code if unavailable
      if ( isPositiveInteger( query.start ) && isPositiveInteger( query.end ) ) {
        db.all( `SELECT DISTINCT transmissions.date, transmissions.fips, transmissions.name, vaccinations.state, transmissions.state_name, transmissions.cases, transmissions.positive, transmissions.severity, vaccinations.complete, vaccinations.complete_pct, vaccinations.complete_12, vaccinations.complete_12_pct, vaccinations.complete_18, vaccinations.complete_18_pct, vaccinations.complete_65, vaccinations.complete_65_pct FROM transmissions OUTER LEFT JOIN vaccinations ON vaccinations.date = transmissions.date AND vaccinations.fips = transmissions.fips WHERE transmissions.date >= ( ? ) AND transmissions.date <= ( ? ) ORDER BY transmissions.fips, transmissions.date`, [ query.start, query.end ], ( error, rows ) => {
          if ( error ) {
            console.log( error );
            res.statusCode = 500;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end( '{"status":500,"message":"Error querying database"}' );
          } else {
            res.statusCode = 200;
            res.setHeader( 'Content-Type', 'application/json' );
            let result = { "data": [], "headers": [ "date", "fips_code", "county_name", "state", "state_name", "cases", "positive_pct", "severity", "complete", "complete_pct", "complete_12", "complete_12_pct", "complete_18", "complete_18_pct", "complete_65", "complete_65_pct" ] };
            for ( let i = 0; i < rows.length; i++ ) {
              let row = rows[ i ];
              result.data.push( [ row.date, row.fips, row.name, row.state, row.state_name, row.cases, row.positive, row.severity, row.complete, row.complete_pct, row.complete_12, row.complete_12_pct, row.complete_18, row.complete_18_pct, row.complete_65, row.complete_65_pct ] );
            }
            res.end( JSON.stringify( result ) );
          }
        } );
      } else {
          res.statusCode = 400;
          res.setHeader( 'Content-Type', 'application/json' );
          res.end( '{"status":400,"message":"Invalid params"}' );
      }
    } else if ( method === "GET" ) {
      fileServer.serve( req, res, ( e, response ) => {
        if ( e ) {
          res.statusCode = 404;
          res.setHeader( 'Content-Type', 'text/plain' );
          res.end( '404 File not found' );
        }
      } );
    } else {
      res.statusCode = 400;
      res.setHeader( 'Content-Type', 'text/plain' );
      res.end( '400 Bad request' );
    }
  } ).resume();
} );

server.listen( PORT, HOSTNAME, () => {
  console.log( `Server running at http://${HOSTNAME}:${PORT}/` );
} );