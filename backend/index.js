const http = require( 'http' );
const sqlite3 = require( 'sqlite3' ).verbose();
const statik = require( 'node-static' );
const qs = require( 'querystring' );
const fs = require( 'fs' );

const HOSTNAME = '0.0.0.0';
const PORT = 3000;

const DB_FILE = "./covid.db";

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

  const db = new sqlite3.Database( "./covid.db", ( err ) => {
    if ( err ) {
      console.log( err );
    } else {
      console.log( "Successfully connected to the database" );

      // Update the database here
    }
  } );
} );

const fileServer = new statik.Server( './static' );
const server = http.createServer( ( req, res ) => {
  let content = '';

  req.addListener( 'data', ( data ) => {
    body += data;

    if ( body.length > 1e6 ) {
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