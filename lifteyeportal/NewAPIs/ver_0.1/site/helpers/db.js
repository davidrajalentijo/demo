var mysql = require( 'mysql' );		// MySQL database


// db config
var env = "dev";
var config = require( './database.json' )[env];
var password = config.password ? config.password : null;

var pool = mysql.createPool({
	host : config.host,
	user : config.user,
	password : config.password,
	database : config.database });

exports.pool = pool;