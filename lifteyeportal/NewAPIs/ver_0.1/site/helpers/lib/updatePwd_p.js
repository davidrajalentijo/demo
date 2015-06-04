// File './site/helpers/lib/updatePwd_p.js'

// Called from ./site/models/auth.js, function "password"

exports.updatePwd = function( userid, pwd, token ) {
	var Q = require( 'q' );
	var deferred = Q.defer();
	var mpool = require('../db').pool;
	mpool.getConnection(function(err, connection) {
		if (err) {
			console.error('CONNECTION error in updatePwd_p.js : ', err);
			deferred.reject( { statusCode: 503, msg: err.code } );
		} else {
			// Update users table with new credentials for 'user'
			connection.query('UPDATE users SET pwd="' + pwd + '", token="' + token + '" WHERE userid=' + userid, function(err, rows) {
				if (err) {
					console.error('MySQL UPDATE error in updatePwd_p.js : ', err.code);
					deferred.reject( { statusCode: 503, msg: err.code } );					
				} else {
					if (rows.changedRows==1) {
						deferred.resolve( { statusCode: 200, updatedusers: rows.changedRows } );
					} else {
						deferred.reject( { statusCode: 503, msg: "user to update credentials not found" } );
					}
				}
			});
		}
		if ( connection ) {
			connection.release();
		}
	});
	return deferred.promise;
}
