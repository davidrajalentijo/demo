// Module dependencies
var 	application_root = __dirname,
	express = require( 'express' ),		// web framework
	path = require( 'path' ),
	config = require( "./config"),
	Backbone = require( 'backbone' ),
	cookieParser = require( 'cookie-parser' ),
	bodyParser = require( 'body-parser' );

// Create server
var app = express();

// Configure server
app.use( express.static( path.join( application_root, 'client' ) ) );	// Where to serve static content
app.use( cookieParser() );
app.use( bodyParser.urlencoded({ extended: true }));			// support x-www-form-urlencoded
app.use( bodyParser.json() );
// app.use( cookieParser( config.cookieSecret ) );


// Routes
require('./site/routes' )(app);


// Start Server
app.listen( config.port, function() {
	console.log( 'Express server listening on port %d in %s mode', config.port, app.settings.env );
} );
