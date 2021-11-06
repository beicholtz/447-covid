const http = require( 'http' );
const https = require( 'https' );
const sqlite3 = require( 'sqlite3' ).verbose();
const statik = require( 'node-static' );
const qs = require( 'querystring' );
const fs = require( 'fs' );

const HOSTNAME = '0.0.0.0';
const PORT = 3000;

const DB_FILE = "./covid.db";
var db;

// If the database exists, then get when it was last updated
// Update it to the current date if behind
// If it doesn't exist, then download the tables and parse
fs.access( DB_FILE, fs.F_OK, ( err ) => {
  var accessDate = new Date( 0 );
  if ( err ) {
    console.log( "Database not found. Creating and updating..." );
  } else {
    // Get the time and update it
    stats = fs.statSync( DB_FILE );
    accessDate = stats.mtime;
  }

  console.log( `Date is ${ accessDate }` );

  db = new sqlite3.Database( "./covid.db" );

  // Create the tables if it doesnt exist
  db.serialize( () => {
    db.run( "CREATE TABLE IF NOT EXISTS vaccinations ( date BIGINT, fips TEXT, name BIGINT, state TEXT, complete INT, complete_pct FLOAT, complete_12 INT, complete_12_pct FLOAT, complete_18 INT, complete_18_pct FLOAT, complete_65 INT, complete_65_pct FLOAT )" );
    db.run( "CREATE TABLE IF NOT EXISTS transmissions ( date BIGINT, fips TEXT, name TEXT, state_name TEXT, cases TEXT, positive FLOAT, severity TEXT )" )
  } );

  // Load the data if required
  if ( accessDate.getTime() ) {
    console.log( "Database is already populated" )
  } else {
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
          let statement = db.prepare( "INSERT INTO transmissions ( date, fips, name, state_name, cases, positive, severity ) VALUES ( ?, ?, ?, ?, ?, ?, ? )" );
          for ( let i = 0; i < data.length; i++ ) {
            statement.run( [ new Date( data[ 3 ] ).getTime(), data[ 2 ], data[ 1 ], data[ 0 ], data[ 4 ], data[ 5 ], data[ 6 ] ] );
            if ( i % 100000 == 0 ) {
              console.log( `Executing transmission statement ${ i }/${ data.length }` );
            }
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
          let statement = db.prepare( "INSERT INTO vaccinations ( date, fips, name, state, complete, complete_pct, complete_12, complete_12_pct, complete_18, complete_18_pct, complete_65, complete_65_pct ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )" );
          for ( let i = 0; i < data.length; i++ ) {
            let slice = data[ i ].slice( 8, 20 );
            slice[ 0 ] = new Date( slice[ 0 ] ).getTime();
            statement.run( slice );
            if ( i % 100000 == 0 ) {
              console.log( `Executing vaccination statement ${ i }/${ data.length }` );
            }
          }
          statement.finalize();
        } );

        console.log( "Done parsing vaccination data" )
      } );
    } ).on( "error", ( e ) => {
      console.error( e );
    } );

    // Set up a runnable to update the data
    // TODO

  }
} );

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
      // TODO

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

process.on( "SIGINT", () => {
  server.close();
  db.close();
} );