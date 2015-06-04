// File 'nodeserver/site/helpers/updatelastlogin.js'
// This file is called from 'logsin' function within 'nodeserver/site/models/auth.js' after a successful login process
var maptime = function() {
	var ts = new Date();
	var hh = ts.getHours() + "";
	var mm = ts.getMinutes() + "";
	var ss = ts.getSeconds() + "";
	var dd = ts.getDate() + "";
	var MM = ts.getMonth() + 1;
	var yy = ts.getFullYear();
	MM = MM + "";
	if (hh.length == 1) { hh = "0" + hh; }
	if (mm.length == 1) { mm = "0" + mm; }
	if (ss.length == 1) { ss = "0" + ss; }
	if (MM.length == 1) { MM = "0" + MM; }
	if (dd.length == 1) { dd = "0" + dd; }
	return yy + "-" + MM + "-" + dd + " " + hh + ":" + mm + ":" + ss;
}

exports.setlastlogindate = function(id) {
    var mpool = require('./db').pool;
	mpool.getConnection(function(err, connection) {
		if (err) {
            console.error('     MySQL Connection error in updatelastlogin.js: ', err);
        } else {
			connection.query('UPDATE users SET lastlogin="' + maptime() + '" WHERE userid=' + id , function(erq, rows, fields) {
				if (erq) {
                    console.error('     MySQL Query update error in updatelastlogin.js: ', erq.code);
                } else {
					console.log('     updated lastlogin date for id ' + id + ', updated fields: ' + rows.changedRows);
				}
			});
		}
		if ( connection ) {
            connection.release();
        }
	});
	return;
}
