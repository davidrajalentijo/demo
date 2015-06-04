// File 'nodeserver/site/helpers/lib/getuserlist_p.js'

var isPrivileged = function(ulist, tts) {
	var ret = false;
	for (var i=0; i<ulist.length; i++) {
		if (ulist[i]==tts) {
			ret = true;
			break;
		}
	}
	return ret;
}

exports.getUserList = function( userid ) {
    var Q = require( 'q' );			// Promises enablement
    var deferred = Q.defer();
    var admin_users = require('../../../config').adminusers;
    if ( isPrivileged(admin_users, userid) ) {
		// User has administration role, so proceed fetching user list
		var mpool = require('../db').pool;
		mpool.getConnection(function(err, connection) {
			if (err) {
            			console.error('CONNECTION error in getuserlist_p.js: ', err);
            			deferred.reject( { statusCode: 503, value: err.code });
        		} else {
				// Query limiting on users with "customer" role, so just one email x customer
				connection.query('SELECT customers.cif, customers.name, customers.TrackVF, users.userid, users.email FROM customers INNER JOIN userconfig ON customers.id = userconfig.customerid INNER JOIN users ON userconfig.userid = users.userid WHERE users.active = 1', function(erq, rows, fields) {
					if (erq) {
                				console.error('MySQL Query error in getuserlist_p.js: ',erq.code);
                    				deferred.reject( { statusCode: 503, msg: erq.code} );
					}
					if (rows.length>0) {
						console.log( '  -> Downloaded list of available customers & users (administrator role)' );
						deferred.resolve( { statusCode: 200, userlist: rows });
					} else {
						console.error( '  -> No available users to list' );
                		deferred.reject( { statusCode: 422, msg: 'No available users to list'} );
					}
				});
			}
			if ( connection ) {
            	connection.release();
        	}
		});
	} else {
		// User has no administration role, reject request
		console.error('  -> User ' + userid + ' has no administration rights');
		deferred.reject( { statusCode: 401, msg: 'User has no admin privileges'} );
	}
	return deferred.promise;
}
