module.exports = {
	port: 81,
	sessionSecret: 'pitopitogorgoritu',
	cookieSecret: 'pitopitogorgoritu',
	cookieMaxAge: (1000 * 60 * 60 * 24 * 30),
	adminusers: [1, 14]
};

// Configuration tips:
// 		The 'adminusers' configuration array is dependant on environment:
//				For DEVELOPMENT database:
//					userid = 1  --> juanra@v2msoft.com
//					userid = 14 --> helpdesk@tamedbytes.com
//				For PRODUCTION database:
