// File 'nodeserver/site/helpers/authp.js'



exports.isSigned = function(user, pwd) {
    var Q = require( 'q' );			// Promises enablement
    var deferred = Q.defer();
    var mpool = require('./db').pool;

    mpool.getConnection(function(err, connection) {

        if (err) {
            console.error('MySQL Connection error in auth.js: ', err);
            deferred.reject( new Error ({ statusCode: 503, msg: err.code}) );
        } else {
            connection.query('SELECT * FROM users WHERE email="' + user + '" AND pwd="' + pwd + '"', function(erq, rows, fields) {
                if (erq) {
                    console.error('MySQL Query error in auth.js: ',erq.code);
                    deferred.reject( new Error ({ statusCode: 503, msg: erq.code}) );
                }

                if (rows.length>0) {
                    console.error( '  -> Right credentials from ' + user );
                    deferred.resolve( { statusCode: 200, msg: true, user: rows[0] } );
                } else {
                    console.error( '  -> Wrong credentials from ' + user );
                    deferred.resolve( { statusCode: 200, msg: false} );
                }

            });

        }

        if ( connection ) {

            connection.release();

        }


    });

    return deferred.promise;
};
