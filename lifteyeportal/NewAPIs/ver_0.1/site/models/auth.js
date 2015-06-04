// File 'nodeserver/site/models/auth.js'

// Called from "nodeserver/site/routes.js" by: app.get('api/auth", auth.isAuthorised);

var randomHex = function( len ) {
	// private function generating random token
	var crypto = require('crypto');
	return crypto.randomBytes( Math.ceil(len/2) ).toString('hex').slice(0,len);
	}

exports.isAuthorised = function(req, res){
	var a_promise = require('../helpers/checktokenp').isAuthorized(req.cookies.user_id, req.cookies.auth_token, req.cookies.role_id);
	a_promise.then(
		function(resolveddata) { 
			if (resolveddata.msg) {
				// auth is positive
				res.statusCode = 200;
				res.send({
					user: resolveddata.user,
					role: resolveddata.role,
					err: ''
				});
			} else {
				// auth token not valid
				res.statusCode = 401;
				res.send({
					user: '',
					role: '',
					err: 'Invalid Authentication token'
				});
			}
		},
		function(rejecteddata) {
			res.statusCode = rejecteddata.statusCode;
			res.send({
	    		user: '',
				role: '',
	    		err: 'Error when authenticating: ' + rejecteddata.msg
			});
		}
	);
}

exports.logsin = function(req, res){
	var usr = req.body.username;
	var pwd = req.body.password;
	console.log(usr);
	console.log(pwd);
	var _ = require( 'underscore' );
	var a_promise = require('../helpers/authp').isSigned(usr, pwd);
	a_promise.then(
		function(resolveddata) {
			if (resolveddata.msg) {
				// auth is positive
				// res.cookie('user_id', resolveddata.user.email, {signed: true, maxAge: config.cookieMaxAge} );
				// res.cookie('auth_token', resolveddata.user.token, {signed: true, maxAge: config.cookieMaxAge} );
				res.cookie('user_id', resolveddata.user.userid );
				res.cookie('auth_token', resolveddata.user.token);
				res.cookie('role_id', resolveddata.user.userid );
				res.statusCode = 200;
				res.send({
					result: _.omit(resolveddata.user, ['pwd', 'token']),
					err: ''
				});
				// updates 'lastlogin' in users table with current date
				require('../helpers/updatelastlogin').setlastlogindate(resolveddata.user.userid);
			} else {
				// auth credentials are wrong
				res.statusCode = 401;
				res.send({
					result: '',
					err: "Invalid credentials provided"
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

exports.logsout = function(req, res) {
	if (req.cookies.user_id != req.cookies.role_id) {
		// quitting from 'running as' mode
		res.cookie('role_id', req.cookies.user_id);
		res.statusCode = 200;
		res.send({
			result: 'Successfully logged out as ' + req.cookies.role_id
		});
	} else {
		// logging out
		res.clearCookie('role_id');
		res.clearCookie('user_id');
		res.clearCookie('auth_token');
		res.statusCode = 200;
		res.send({
			result: 'User ' + req.cookies.user_id + ' has successfully logged out'
		});
	}
}

exports.logsas = function(req, res) {
	var newrole = req.body.roleid;
	var a_promise = require('../helpers/checktokenp').isAuthorized(req.cookies.user_id, req.cookies.auth_token, newrole);
	a_promise.then(
		function(resolveddata) { 
			if (resolveddata.msg) {
				// auth is positive, update cookie with new role
				res.cookie('role_id', newrole);
				res.statusCode = 200;
				res.send({
					user: resolveddata.user,
					role: resolveddata.role,
					err: ''
				});
			} else {
				// auth token not valid
				res.statusCode = 401;
				res.send({
					user: '',
					role: '',
					err: 'Invalid Authentication token'
				});
			}
		},
		function(rejecteddata) {
			res.statusCode = rejecteddata.statusCode;
			res.send({
	    		user: '',
				role: '',
	    		err: 'Error when authenticating: ' + rejecteddata.msg
			});
		}
	);
}

exports.userlist = function(req, res) {
	var a_promise = require('../helpers/checktokenp').isAuthorized(req.cookies.user_id, req.cookies.auth_token, req.cookies.role_id);
	a_promise.then(
		function(resolveddata) {
			if (resolveddata.msg) {
				// auth is positive, fetch user list (only if administrator profile)
				var ul_promise = require('../helpers/lib/getuserlist_p').getUserList(req.cookies.user_id);
				ul_promise.then(
					function(accepteddata) {
						// All OK, return list of available users
						res.statusCode = 200;
						res.send ({
			                            UserList: accepteddata.userlist,
                        			    err: ''
                       				});
					},
					function(refuseddata) {
						res.statusCode = refuseddata.statusCode;
                        			res.send ({
                        				result: '',
                        				err: 'Error when fetching user list: ' + refuseddata.msg
                        			});
					}
				);
			} else {
				// auth token not valid
				res.statusCode = 401;
				res.send({
					user: '',
					role: '',
					err: 'Invalid Authentication token'
				});
			}
		},
		function(rejecteddata) {
			res.statusCode = rejecteddata.statusCode;
			res.send({
	    		user: '',
				role: '',
	    			err: 'Error when authenticating: ' + rejecteddata.msg
			});
		}
	);
}


exports.password1 = function(req, res) {
	var pwd1 = req.body.password1;
	var pwd2 = req.body.password2;
	var a_promise = require('../helpers/checktokenp').isAuthorized(req.cookies.user_id, req.cookies.auth_token, req.cookies.role_id);
	a_promise.then(
		function(resolveddata) {
			if (resolveddata.msg) {
				// auth is positive but ONLY accept password change if not logging as
				if (req.cookies.user_id != req.cookies.role_id) {
					res.statusCode = 403;
					res.send({
						user: '',
						role: '',
						err: 'Can not change password while logged as a different user'
					});
				} else {
					// proceed with password change
					if (pwd1.length<5 || pwd2.length<5) {
						res.statusCode = 405;
						res.send({
							user: '',
							role: '',
							err: 'New password must have at least 5 characters'
						});
					} else if (pwd1 != pwd2) {
						res.statusCode = 405;
						res.send({
							user: '',
							role: '',
							err: 'Check both passwords as they difer'
						});
					} else {
						// Proceed with password update, needs to generate a new token
						var newToken = randomHex(48);
						var u_promise = require('../helpers/lib/updatePwd_p').updatePwd(req.cookies.user_id, pwd1, newToken);
						u_promise.then(
							function(accepteddata) {
								// All ok, update cookie
								res.cookie('auth_token', newToken);
								res.statusCode = 200;
								res.send({
									user: req.cookies.user_id,
									role: req.cookies.user_id,
									err: ''
								});
							},
							function(refuseddata) {
								res.statusCode = refuseddata.statusCode;
								res.send({
									user: '',
									role: '',
									err: 'Error when updating credentials: ' + refuseddata.msg
								});
							}
						);
					}
				} 
			} else {
				// auth token not valid
				res.statusCode = 401;
				res.send({
					user: '',
					role: '',
					err: 'Invalid Authentication token'
				});
			}
		},
		function(rejecteddata) {
			res.statusCode = rejecteddata.statusCode;
			res.send({
				user: '',
				role: '',
				err: 'Error when authenticating: ' + rejecteddata.msg
			});
		}
	);
}
