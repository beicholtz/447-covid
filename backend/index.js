const http = require( 'http' );
const https = require( 'https' );
const sqlite3 = require( 'sqlite3' ).verbose();
const statik = require( 'node-static' );
const qs = require( 'querystring' );
const fs = require( 'fs' );

const HOSTNAME = '0.0.0.0';
const PORT = 3072;

const db = new sqlite3.Database( './covidData.db' );

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
        //`SELECT DISTINCT transmissions.date, transmissions.fips, transmissions.name, vaccinations.state, transmissions.state_name, transmissions.cases, 
        //transmissions.positive, transmissions.severity, vaccinations.complete, vaccinations.complete_pct, vaccinations.complete_12, 
        //vaccinations.complete_12_pct, vaccinations.complete_18, vaccinations.complete_18_pct, vaccinations.complete_65, vaccinations.complete_65_pct 
        //FROM transmissions OUTER LEFT JOIN vaccinations ON vaccinations.date = transmissions.date AND vaccinations.fips = transmissions.fips WHERE transmissions.date >= ( ? ) AND transmissions.date <= ( ? ) AND transmissions.fips = ( ? ) ORDER BY transmissions.fips, transmissions.date`, [ query.start, query.end, query.fips ],
        db.all(  `SELECT * from vaccinations JOIN transmissions ON vaccinations.fips = ( ? ) AND transmissions.fips = ( ? )` , [ query.fips, query.fips ], ( error, rows ) => {
          if ( error ) {
            console.log( error );
            res.statusCode = 500;
            res.setHeader( 'Content-Type', 'application/json' );
            res.end( '{"status":500,"message":"Error querying database"}' );
          } else {
            res.statusCode = 200;
            res.setHeader("Access-Control-Allow-Origin", '*');
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