// File 'nodeserver/site/models/sites.js'

// Called from "nodeserver/site/routes.js" by: app.get('api/sites", sites.getMySites);


exports.getMySites = function(req, res) {
	var _ = require( 'underscore' );
	var Q = require( 'q' );
	// First, check authentication
	var a_promise = require('../helpers/checktokenp').isAuthorized(req.cookies.user_id, req.cookies.auth_token, req.cookies.role_id);
	a_promise.then(
		function(resolveddata) {
			if (resolveddata.msg) {
				// auth is positive, so now fetch groups
				var g_promise = require('../helpers/lib/mygroupsp').getGroups(resolveddata.role.email);
				g_promise.then(
					function(accepteddata) { 
						if (accepteddata.statusCode === 200) {
							// All OK, now get sites from every fetched groups
							var grouplist = _.map(accepteddata.value, function(o) { return _.omit(o, 'email')});
							console.log("     downloaded groups :  " + accepteddata.length);
							var promisearray = [];
							for (var i = 0; i < accepteddata.length; i++) {
								promisearray.push( require('../helpers/lib/getsitesfromgroupid_p').getsites(grouplist[i].allowedgroupid));
							}
							var deferred = Q.defer();
							Q.all(promisearray).then(
								function(retdata) { 
									for (var j = 0; j < accepteddata.length; j++) {
										grouplist[j]["sites"] = retdata[j];
									}
									res.statusCode = 200;
									res.send ( grouplist );
								}, function(abortdata) {
									res.statusCode = abortdata.statusCode;
									res.send ({
										result: '',
										err: 'Error when fetching sites: ' + abortdata.msg
									});
								}
							);
                        } else {
                            // No groups
                            res.statusCode = 204;
                            res.send ({
                            	result: '',
                                err: accepteddata.value,
                                length: 0
                            });
                        }
					}, function(refuseddata) {
                    	res.statusCode = refuseddata.statusCode;
                        res.send ({
                        	result: '',
                            err: 'Error when fetching groups: ' + refuseddata.msg
                        });
                    }
				);
			} else {
				// auth token not valid, abort and return
				res.statusCode = 401;
				res.send({
					result: '',
					err: 'Invalid Authentication token'
				});
			}
		},
		function(rejecteddata) {
			res.statusCode = rejecteddata.statusCode;
			res.send({
		    	result: '',
		    	err: 'Error when authenticating: ' + rejecteddata.msg
			});
		}
	);
}
