// File 'nodeserver/site/models/groups.js'

// Called from "nodeserver/site/routes.js" by: app.get('api/groups", group.getMyGroups);


exports.getMyGroups = function(req, res){
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
							// All OK, return groups
							res.statusCode = 200;
							res.send ({
                            	result: accepteddata.value,
                                err: '',
                                length: accepteddata.length
                            });
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
				// auth token not valid
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
