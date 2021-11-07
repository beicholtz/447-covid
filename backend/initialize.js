const https = require( 'https' );
const sqlite3 = require( 'sqlite3' ).verbose();

const db = new sqlite3.Database( './covidData.db' );

function initDB(){
    // db.serialize( () => {
    //     db.run( "CREATE TABLE vaccinations ( date BIGINT, fips TEXT, name TEXT, state TEXT, complete INT, complete_pct FLOAT, complete_12 INT, complete_12_pct FLOAT, complete_18 INT, complete_18_pct FLOAT, complete_65 INT, complete_65_pct FLOAT )" );
    //     db.run( "CREATE TABLE transmissions ( date BIGINT, fips TEXT, name TEXT, state_name TEXT, cases TEXT, positive FLOAT, severity TEXT )" )
    //   } );
      
    //   console.log( "Downloading transmission data..." );
    //   https.get( "https://data.cdc.gov/api/views/nra9-vzzn/rows.json", ( res ) => {
    //     let body = "";
      
    //     res.on( "data", ( chunk ) => {
    //       body += chunk;
    //     } );
      
    //     res.on( "end", () => {
    //       console.log( "Parsing transmission data..." );
    //       let data = JSON.parse( body ).data;
    //       // Load it into the database
    //       console.log( `Inserting transmission data(${ data.length } entries)...` );
    //       db.serialize( () => {
    //         let statement = db.prepare( "INSERT INTO transmissions VALUES ( ?, ?, ?, ?, ?, ?, ? )" );
    //         for ( let i = 0; i < data.length; i++ ) {
    //           let row = data[ i ];
    //           let date = new Date( row[ 11 ] );
    //           date.setUTCHours( 0 );
    //           date.setMinutes( 0 );
    //           date.setSeconds( 0 );
    //           date.setMilliseconds( 0 );
    //           statement.run( [ date.getTime(), row[ 10 ], row[ 9 ], row[ 8 ], row[ 12 ], row[ 13 ], row[ 14 ] ] );
    //         }
    //         statement.finalize();
    //       } );
      
    //       console.log( "Done parsing transmission data" );
    //     } )
    //   } ).on( "error", ( e ) => {
    //     console.error( e );
    //   } );
      
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
}

initDB();