const http = require( 'http' );
const https = require( 'https' );
const sqlite3 = require( 'sqlite3' ).verbose();
const statik = require( 'node-static' );
const qs = require( 'querystring' );
const fs = require( 'fs' );
const schedule = require( 'node-schedule' );
const fastcsv = require( 'fast-csv' );

const DB_FILE = "./covidData.db";
const HOSTNAME = '0.0.0.0';
const PORT = 3072;

const DB_EXISTS = fs.existsSync( DB_FILE );

const db = new sqlite3.Database( './covidData.db' );

db.serialize( () => {
  db.run( `CREATE TABLE IF NOT EXISTS vaccinations (
    v_date DATE,
    v_fips TEXT,
    state TEXT,
    complete_pct FLOAT,
    complete_12 INT,
    complete_12_pct FLOAT,
    complete_18 INT,
    complete_18_pct FLOAT,
    complete_65 INT,
    complete_65_pct FLOAT,
    PRIMARY KEY ( v_date, v_fips ) )` );
  db.run( `CREATE TABLE IF NOT EXISTS cases (
    c_date DATE,
    c_fips TEXT,
    name TEXT,
    state_name TEXT,
    cases INT,
    cases_avg FLOAT,
    case_avg_per_100k FLOAT,
    deaths INT,
    deaths_avg INT,
    deaths_avg_per_100k FLOAT,
    PRIMARY KEY ( c_date, c_fips ) )`)
} );

vaccinationHeaders = [
  'Date',
  'FIPS',
  undefined, undefined,
  'Recip_State',
  'Series_Complete_Pop_Pct',
  undefined,
  'Series_Complete_12Plus',
  'Series_Complete_12PlusPop_Pct',
  'Series_Complete_18Plus',
  'Series_Complete_18PlusPop_Pct',
  'Series_Complete_65Plus',
  'Series_Complete_65PlusPop_Pct',
  undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
];

function repeatWithDelim( s, c, d ) {
  r = s;
  for ( let i = 1; i < c; i++ ) r += d + s;
  return r;
}

function loadVaccinationData( vaccinationDataCsvStr, callback = undefined ) {
  let vaccinationData = [];
  fastcsv.parseString( vaccinationDataCsvStr, { headers: vaccinationHeaders } )
    .on( 'error', ( error ) => {
      console.error( error );
    } )
    .on( 'data', ( data ) => {
      if ( data[ "Date" ] ) {
        let splitDate = data[ "Date" ].split( "/" );
        data[ "Date" ] = splitDate[ 2 ] + "-" + splitDate[ 0 ] + "-" + splitDate[ 1 ];
      }
      vaccinationData.push( Object.values( data ) );
    } )
    .on( 'end', ( rowCount ) => {
      vaccinationData.shift();
      db.serialize( () => {
        db.run( "BEGIN TRANSACTION" );
        for ( let i = 0; i < vaccinationData.length; i += 500 ) {
          db.run( `INSERT INTO vaccinations VALUES ${ repeatWithDelim( "(?,?,?,?,?,?,?,?,?,?)", Math.min( 500, vaccinationData.length - i ), "," ) } ON CONFLICT ( v_date, v_fips ) DO NOTHING`, vaccinationData.slice( i, Math.min( i + 500, vaccinationData.length ) ).flat() );
        }
        db.run( "COMMIT" );
      } );
      if ( callback ) {
        callback();
      }
    } );
}

function loadCaseData( caseDataCsvStr, callback = undefined ) {
  let caseData = [];
  fastcsv.parseString( caseDataCsvStr, { headers: false } )
    .on( 'error', ( error ) => {
      console.error( error );
    } )
    .on( 'data', ( data ) => {
      if ( data[ 1 ] ) {
        data[ 1 ] = data[ 1 ].split( "-" )[ 1 ];
      }
      caseData.push( data );
    } )
    .on( 'end', ( rowCount ) => {
      caseData.shift();
      db.serialize( () => {
        db.run( "BEGIN TRANSACTION" );
        for ( let i = 0; i < caseData.length; i += 500 ) {
          db.run( `INSERT INTO cases VALUES ${ repeatWithDelim( "(?,?,?,?,?,?,?,?,?,?)", Math.min( 500, caseData.length - i ), "," ) } ON CONFLICT ( c_date, c_fips ) DO NOTHING`, caseData.slice( i, Math.min( i + 500, caseData.length ) ).flat() );
        }
        db.run( "COMMIT" );
      } );
      if ( callback ) {
        callback();
      }
    } );
}

if ( !DB_EXISTS ) {
  console.log( "Database file not detected. Loading data..." );
  if ( fs.existsSync( "./vaccination-data.csv" ) ) {
    console.log( "Reading vaccination data file" );
    loadVaccinationData( fs.readFileSync( "./vaccination-data.csv" ), () => { console.log( "Done loading vaccination data" ); } );
  } else {
    console.log( "Downloading vaccination data" );
    https.get( "https://data.cdc.gov/resource/8xkx-amqh.csv", ( res ) => {
      let vaccinationBody = "";

      res.on( "data", ( chunk ) => {
        vaccinationBody += chunk;
      } );

      res.on( "end", () => {
        console.log( "Loading vaccination data..." );
        loadVaccinationData( vaccinationBody, () => { console.log( "Done loading vaccination data" ); } );
      } );
    } ).on( "error", ( e ) => {
      console.error( e );
    } );
  }

  for ( let i = 2020; i < 2025; i++ ) {
    let filename = `./us-counties-${ i }.csv`;
    if ( fs.existsSync( filename ) ) {
      console.log( "Reading case data file for year " + i );
      loadCaseData( fs.readFileSync( filename ), () => { console.log( "Done loading case data for year " + i ); } );
    } else {
      console.log( "Downloading case data for year " + i );
      https.get( `https://raw.githubusercontent.com/nytimes/covid-19-data/master/rolling-averages/us-counties-${ i }.csv`, ( res ) => {
        if ( res.statusCode == 404 ) {
          console.log( "No case data for year " + i );
        } else {
          let caseBody = "";

          res.on( "data", ( chunk ) => {
            caseBody += chunk;
          } );

          res.on( "end", () => {
            console.log( `Loading case data for year ${ i }...` );
            loadCaseData( caseBody, () => { console.log( "Done loading case data for year " + i ); } );
          } );
        }
      } ).on( "error", ( e ) => {
        console.error( e );
      } );
    }
  }
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
      if ( query.start && query.end ) {
        let statement = query.fips ? `SELECT vaccinations.*, cases.* FROM vaccinations LEFT JOIN cases ON v_date = c_date AND v_fips = c_fips WHERE ( v_date >= $start AND v_date <= $end AND v_fips = $fips ) OR ( c_date >= $start AND c_date <= $end AND c_fips = $fips )
              UNION ALL
              SELECT vaccinations.*, cases.* FROM cases LEFT JOIN vaccinations ON v_date = c_date AND v_fips = c_fips WHERE ( v_date >= $start AND v_date <= $end AND v_fips = $fips ) OR ( c_date >= $start AND c_date <= $end AND c_fips = $fips ) AND v_date IS NULL AND v_fips IS NULL` :
              `SELECT vaccinations.*, cases.* FROM vaccinations LEFT JOIN cases ON v_date = c_date AND v_fips = c_fips WHERE ( v_date >= $start AND v_date <= $end ) OR ( c_date >= $start AND c_date <= $end )
              UNION ALL
              SELECT vaccinations.*, cases.* FROM cases LEFT JOIN vaccinations ON v_date = c_date AND v_fips = c_fips WHERE ( v_date >= $start AND v_date <= $end ) OR ( c_date >= $start AND c_date <= $end ) AND v_date IS NULL AND v_fips IS NULL`
        // Full join
        db.all( statement, { $start: query.start, $end: query.end, $fips: query.fips }, ( error, rows ) => {
          if ( error ) {
            console.log( error );
            res.statusCode = 500;
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.setHeader( 'Content-Type', 'application/json' );
            res.end( '{"status":500,"message":"Error querying database"}' );
          } else {
            res.statusCode = 200;
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.setHeader( 'Content-Type', 'application/json' );
            let result = { "data": [], "headers": [ "date", "fips", "county_name",  "state_name", "state", "complete_pct", "complete_12", "complete_12_pct", "complete_18", "complete_18_pct", "complete_65", "complete_65_pct", "cases", "cases_avg", "case_avg_per_100k", "deaths", "deaths_avg", "deaths_avg_per_100k" ] };
            for ( let i = 0; i < rows.length; i++ ) {
              let row = rows[ i ];
              result.data.push( [ row.c_date ? row.c_date : row.v_date, row.c_fips ? row.c_fips : row.v_fips, row.name, row.state_name, row.state, row.complete_pct, row.complete_12, row.complete_12_pct, row.complete_18, row.complete_18_pct, row.complete_65, row.complete_65_pct, row.cases, row.cases_avg, row.case_avg_per_100k, row.deaths, row.deaths_avg, row.deaths_avg_per_100k ] );
            }
            res.end( JSON.stringify( result ) );
          }
        } );
      } else {
          res.statusCode = 400;
          res.setHeader("Access-Control-Allow-Origin", '*');
          res.setHeader( 'Content-Type', 'application/json' );
          res.end( '{"status":400,"message":"Invalid params"}' );
      }
    } else if ( method === "GET" ) {
      fileServer.serve( req, res, ( e, response ) => {
        if ( e ) {
          res.statusCode = 404;
          res.setHeader("Access-Control-Allow-Origin", '*');
          res.setHeader( 'Content-Type', 'text/plain' );
          res.end( '404 File not found' );
        }
      } );
    } else {
      res.statusCode = 400;
      res.setHeader("Access-Control-Allow-Origin", '*');
      res.setHeader( 'Content-Type', 'text/plain' );
      res.end( '400 Bad request' );
    }
  } ).resume();
} );

server.listen( PORT, HOSTNAME, () => {
  console.log( `Server running at http://${HOSTNAME}:${PORT}/` );
} );

process.on( "SIGINT", () => {
  server.close();
  db.close();
} );