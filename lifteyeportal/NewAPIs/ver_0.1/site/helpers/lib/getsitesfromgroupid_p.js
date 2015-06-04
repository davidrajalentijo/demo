// File 'nodeserver/site/helpers/lib/getsitesfromgroupid_p.js'

exports.getsites = function(groupid) {
    var _ = require( 'underscore' );
    var Q = require( 'q' );			// Promises enablement
    var deferred = Q.defer();
    var mpool = require('../db').pool;

    mpool.getConnection(function(err, connection) {
        if (err) {
            console.error('MySQL Connection error in getsitesfromgroupid_p.js: ', err);
            deferred.reject( new Error ({ statusCode: 503, msg: err.code}) );
        } else {
	    connection.query('SELECT * FROM liftsites WHERE parentgroupid=' + groupid, function(erq, rows, fields) {
		if (erq) {
                    console.error('MySQL Query error in getsitesfromgroupid_p.js: ',erq.code);
                    deferred.reject( new Error ({ statusCode: 503, msg: erq.code}) );
                } else {
		    deferred.resolve( rows );
		}
	    });
	}
		
	if ( connection ) {
            connection.release();
        }
    });

    return deferred.promise;
};
