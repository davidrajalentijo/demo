// File 'nodeserver/site/helpers/checktokenp.js'

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

exports.isAuthorized = function(id, token, roleid) {
    var _ = require( 'underscore' );
    var Q = require( 'q' );			// Promises enablement
    var deferred = Q.defer();
    var mpool = require('./db').pool;

    mpool.getConnection(function(err, connection) {
        if (err) {
            console.error('MySQL Connection error in checktokenp.js: ', err);
            deferred.reject( { statusCode: 503, msg: err.code} );
        } else {
		// First check role assingment
		var admin_users = require('../../config').adminusers;
		var go_ahead = true;
		if ( id != roleid ) {
			if ( !isPrivileged(admin_users, id) ) {
				// user is not allowed to perform a 'log as' operation, simply reject...
				go_ahead = false;
				console.error("User " + id + " has no admin privileges");
				deferred.reject( { statusCode: 401, msg: 'User has no admin privileges'} );
			}
		}
		if (go_ahead) {
			// check that id & roleid exist; otherwise most probably auth cookie is missing
			if (typeof id === 'undefined' || typeof roleid === 'undefined' || typeof token === 'undefined') {
				// reject as auth cookie is missing or not well parsed
				go_ahead = false;
				console.error( '  -> Missing credentials !' );
				deferred.resolve( { statusCode: 200, msg: false} );
			}
		}
		if (go_ahead) {
			// check that id & roleid is an integer; otherwise reject
			if ( !(id == parseInt(id, 10) && roleid == parseInt(roleid, 10)) ) {
				// reject as id or roleid is not an integer
				go_ahead = false;
				console.error( '  -> Malformed auth cookie ' );
				deferred.resolve( { statusCode: 200, msg: false} );
			}
		}
		if (go_ahead) {
			if ( id != roleid ) {
				var r_promise = require('./lib/getroleuser_p').getUserFromID(roleid);
				r_promise.then(
					function(accepteddata) {
						connection.query('SELECT * FROM users WHERE userid=' + id + ' AND token="' + token + '"', function(erq, rows, fields) {
							if (erq) {
								console.error('MySQL Query error in checktokenp.js: ', erq.code);
								deferred.reject( { statusCode: 503, msg: erq.code} );
							}
							if (rows.length>0) {
								console.log( '  -> Right credentials from id ' + id + ' : ' + rows[0].email);
								deferred.resolve(
									{ statusCode: 200,
									  msg: true,
									  user: _.omit(rows[0], ['pwd', 'token']),
									  role: _.omit(accepteddata.role, ['pwd', 'token'])
									});
							} else {
								console.error( '  -> Wrong credentials from id ' + id);
                						deferred.resolve( { statusCode: 200, msg: false} );	
							}
						});
					}, function(rejecteddata) {
						deferred.reject( { statusCode: rejecteddata.statusCode, msg: rejecteddata.msg });
					}
				);
			} else {
				connection.query('SELECT * FROM users WHERE userid=' + id + ' AND token="' + token + '"', function(erq, rows, fields) {
					if (erq) {
		                    	console.error('MySQL Query error in checktokenp.js: ',erq.code);
                				deferred.reject( { statusCode: 503, msg: erq.code} );
                			}
            				if (rows.length>0) {
                				console.log( '  -> Right credentials from id ' + id + ' : ' + rows[0].email );
                				deferred.resolve( 
							{ statusCode: 200, 
							  msg: true, 
							  user: _.omit(rows[0], ['pwd', 'token']),
							  role: _.omit(rows[0], ['pwd', 'token']) 
							} );
            				} else {
                				console.error( '  -> Wrong credentials from id ' + id );
                				deferred.resolve( { statusCode: 200, msg: false} );
            				}
				});
			}
		}
	}	
	if ( connection ) {
            connection.release();
        }
    });
    return deferred.promise;
};
