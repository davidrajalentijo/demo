// File 'nodeserver/site/helpers/lib/getroleuser_p.js'

// Called from 'nodeserver/site/helpers/checktokenp.js'

exports.getUserFromID = function(userid) {

    var Q = require( 'q' );
    var deferred = Q.defer();
    var mpool = require('../db').pool;

    mpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error in getroleuser_p.js: ', err);
            deferred.reject( { statusCode: 503, value: err.code });
        } else {
			connection.query('SELECT * FROM users WHERE userid = ' + userid, function(erq, rows, fields) {
				if (erq) {
                	console.error('MySQL Query error in getroleuser_p.js: ',erq.code);
                    deferred.reject( { statusCode: 503, msg: erq.code} );
				}
            	if (rows.length>0) {
                	console.log( '  -> Downloaded role user data from id ' + userid + ' : ' + rows[0].email );
                	deferred.resolve( { statusCode: 200, role: rows[0] });
            	} else {
                	console.error( '  -> Role user with id ' + userid + ' does not exist' );
                	deferred.reject( { statusCode: 422, msg: 'Role user with id ' + userid + ' does not exist'} );
            	}
			});
          
		}
		if ( connection ) {
            connection.release();
        }
	});
	return deferred.promise;
}
