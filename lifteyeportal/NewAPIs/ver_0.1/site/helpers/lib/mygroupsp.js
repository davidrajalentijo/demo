// File 'nodeserver/site/helpers/lib/mygroupsp.js'


// Called from 'nodeserver/site/models/groupsp.js'

exports.getGroups = function(username) {

    var Q = require( 'q' );
    var deferred = Q.defer();
    var mpool = require('../db').pool;

    mpool.getConnection(function(err, connection) {
        if (err) {
            console.error('CONNECTION error in groupsp.js: ', err);
            deferred.reject(new Error ({ statusCode: 503, value: err.code }));
        } else {
            connection.query('SELECT users.email, userconfig.userid, userconfig.parentid, userconfig.customerid FROM users INNER JOIN userconfig ON userconfig.userid = users.userid AND users.email="' + username + '"', function(erq, rows, fields) {
                if (erq) {
                    console.error('MySQL error in mygroupsp.js: ', erq.code);
                    deferred.reject(new Error ({ statusCode: 503, value: erq.code}));
                }
                if (rows.length>0) {
                    mpool.getConnection(function(erc, conn) {
                        if (erc) {
                            console.error('MySQL connection error in mygroupsp.js: ', erc);
                            deferred.reject(new Error ({ statusCode: 503, value: erc.code}));
                        } else {
                            if (rows[0].parentid=='0') {
                                // Profile is customer
                                conn.query('SELECT groups.groupid, groups.groupname FROM groups WHERE groups.parentid = "' + rows[0].customerid + '"', function(erk, rws, flds) {
                                    if (erk) {
                                        console.error('MySQL query error in misc.js: ', erk);
                                        deferred.reject(new Error ( { statusCode: 503, value: erk.code}));
                                    }
                                    // populate return array
                                    var rslt = [];
                                    for (var i in rws) {
                                        var lin = new Object;
                                        lin.allowedgroupid = rws[i].groupid;
                                        lin.email = username;
                                        lin.groupname = rws[i].groupname; 
                                        rslt[i] = lin;
                                    }
                                    deferred.resolve({ statusCode: 200, value: rslt, length: rslt.length });
                                });
                            } else {
                                // Profile is user
                                conn.query('SELECT permissions.allowedgroupid, users.email, groups.groupname FROM users INNER JOIN permissions INNER JOIN groups ON permissions.parentpermissionid = users.userid AND users.email="' + username + '" AND permissions.allowedgroupid = groups.groupid', function(erk, rws, flds) {
                                    if (erk) {
                                        console.error('MySQL query error in misc.js: ', erk);
                                        deferred.reject(new Error ({ statusCode: 503, value: erk.code}));
                                    }
                                    deferred.resolve({ statusCode: 200, value: rws, length: rws.length });
                                });
                            }
                        }
                        if (conn) {
                            conn.release();
                        }
                    });
                } else {
                    console.error('No groups assigned to ' + username);
                    deferred.resolve({ statusCode: 204, value: 'No groups assigned to' + username });
                }
                if (connection) {
                    connection.release();
                }
            });
        }
    });
    return deferred.promise;
};