INTRODUCTION

This file explains supported APIs and tips to full test them. APIs follow a REST model.

To set up node server, just:
	1) go to /home/ec2-user/Portal/ver_0.1 directory
	2) type 'sudo node server.js'

Current version is 0.1


USER MODE

Any response to calls will be given in JSON format. Calls must follow current pattern:
    DEVELOPMENT:
		http://desarrollo.tamedbytes.com:81/api/<api_name>/<parameters>

Most of calls will be access protected. Credentials to be used are customer email as username and password is MD5 hashed
In Development environment, you can use following credentials:
		Login:		helpdesk@tamedbytes.com
		Password: 	763b8741d9f1a6fb4e0b72865d99f33
		Token:		abracadabra



APIS DESCRIPTION

_____________________________________________________________________________________________________

	Authentication API Calls Subset
_____________________________________________________________________________________________________


General Process of authentication:
	1st: 	call 'login' api including credentials in body. If successful, an authentication cookie is sent back from server, use it for future calls.
		curl -X POST -v -c cookies.txt -H "Content-Type: application/json" -d "{\"username\":\"helpdesk@tamedbytes.com\", \"password\":\"763b8741d9f1a6fb4e0b72865d993f33\"}" http://desarrollo.tamedbytes.com:81/api/auth/login
		
	2nd:	call any other api by including authentication cookie in the call. As example, we call the 'auth' api to get user's model
		curl -X GET -v -b cookies.txt http://desarrollo.tamedbytes.com:81/api/auth

API calls list:
		Name:	auth
		Type:	GET
		URL:	http://desarrollo.tamedbytes.com:81/api/auth
		Protected: Yes, using token in cookie (see 'login' call in order to get credentials token cookie)
		Description: provides user model for specific user
		CurL:	curl -X GET -v --cookie "user_id=14;auth_token=abracadabra" http://desarrollo.tamedbytes.com:81/api/auth


		Name:	login
		Type:	POST
		URL:	http://desarrollo.tamedbytes.com:81/api/auth/login
		Protected: No
		Description: performs login checkout. Needs to pass username/password credentials in json within body
				If successfull, a cookie back is sent containing credentials data to be used in other API calls
		CurL:	WIN --> curl -X POST -v -c cookies.txt -H "Content-Type: application/json" -d "{\"username\":\"helpdesk@tamedbytes.com\", \"password\":\"763b8741d9f1a6fb4e0b72865d993f33\"}" http://desarrollo.tamedbytes.com:81/api/auth/login
			LIN --> curl -X POST -v -H "Content-Type: application/json" -d '{"username":"helpdesk@tamedbytes.com", "password":"763b8741d9f1a6fb4e0b72865d993f33"}' http://desarrollo.tamedbytes.com:81/api/auth/login


		Name:	logout
		Type:   GET
		URL:	http://desarrollo.tamedbytes.com:81/api/auth/logout
		Protected: No
		Description: Logs out; if user is an administrator and logged as another user, it will log out as this user and state as the adiminstrator
				If successfull and logged as, a new cookie is sent back to update current credentials status 
		Curl:	curl -X GET -v -b cookies.txt -c newCookie.txt http://desarrollo.tamedbytes.com:81/api/auth/logout
		Output example:
			{"result":"User 14 has successfully logged out"}    OR   {"result":"Successfully logged out as 37"}


		Name:	logas
		Type:	POST
		URL:	http://desarrollo.tamedbytes.com:81/api/auth/logas
		Protected: Yes
		Description: performs a "log as" role adoption, only valid if user is administrator
				If successfull, a new cookie is sent back to update current credentials status
		Curl:	curl -X POST -v -b cookies.txt -c newCookie.txt -H "Content-Type: application/json" -d "{\"roleid\":37}" http://desarrollo.tamedbytes.com:81/api/auth/logas
		Output: same output as auth


		Name:	userlist
		Type:	GET
		URL:	http://desarrollo.tamedbytes.com:81/api/auth/userlist
		Protected: Yes
		Description: if user has administration rights, returns a complete list of available users (with "customer" profile)
		Curl:	curl -X GET -b cookies.txt http://desarrollo.tamedbytes.com:81/api/auth/userlist
		Output example:
			{"UserList":
				[{"cif":"A00001234","name":"TamedBytes SL","TrackVF":0,"userid":14,"email":"helpdesk@tamedbytes.com"},
				 {"cif":"A01234567","name":"Cliente Dummy","TrackVF":0,"userid":16,"email":"dani@tamedbytes.com"}],
			 "err":""}

_____________________________________________________________________________________________________

Name:	groups
Type:	GET
URL:	http://desarrollo.tamedbytes.com:81/api/groups
Protected: Yes, using full credentials
Description: provides list of available groups for specific user.
CurL:	curl -X GET -v -b cookies.txt http://desarrollo.tamedbytes.com:81/api/groups
Output example:
	{"result":
		[{"allowedgroupid":15,"email":"helpdesk@tamedbytes.com","groupname":"Tracks"},
		 {"allowedgroupid":16,"email":"helpdesk@tamedbytes.com","groupname":"Grupo B"},
		 {"allowedgroupid":17,"email":"helpdesk@tamedbytes.com","groupname":"Grupo A"},
		 {"allowedgroupid":18,"email":"helpdesk@tamedbytes.com","groupname":"Development"},
		 {"allowedgroupid":43,"email":"helpdesk@tamedbytes.com","groupname":"Sin Configurar"}],
	"err":"",
	"length":5}


Name:	sites
Type:	GET
URL:	http://desarrollo.tamedbytes.com:81/api/sites
Protected: Yes, using full credentials
Description: provides full tree of available trees grouped for every available group
CurL: 	curl -X GET -b cookies.txt http://desarrollo.tamedbytes.com:81/api/sites
Output example:
	[
		{"allowedgroupid":15,
		 "groupname":"Tracks",
		 "sites":[
			{"liftsiteid":25,"parentgroupid":15,"sitename":"Piloto", ...}
			{"liftsiteid":26,"parentgroupid":15,"sitename":"M0021", ...}
			{"liftsiteid":28,"parentgroupid":15,"sitename":"SE003", ...}
			...
			{"liftsiteid":104,"parentgroupid":15,"sitename":"Kk", ...}
			]},
		{"allowedgroupid":16,
	 	 "groupname":"Grupo B",
	 	 "sites":[
			{"liftsiteid":30,"parentgroupid":16,"sitename":"C4268", ...}
			]},
		{"allowedgroupid":17,
		 "groupname":"Grupo A",
		 "sites":[
			{"liftsiteid":24,"parentgroupid":17,"sitename":"SONDA", ...}
			{"liftsiteid":49,"parentgroupid":17,"sitename":"INS04", ...}
			...
			{"liftsiteid":103,"parentgroupid":17,"sitename":"Unknown", ...}
			]},
		{"allowedgroupid":18,
		 "groupname":"Development",
		 "sites":[
			{"liftsiteid":51,"parentgroupid":18,"sitename":"LLE032", ...}
			{"liftsiteid":66,"parentgroupid":18,"sitename":"DEV_KIT", ...}
			...
			{"liftsiteid":102,"parentgroupid":18,"sitename":"MaletaDe", ...}
			]},
		{"allowedgroupid":43,
		 "groupname":"Sin Configurar",
		 "sites":[
			{"liftsiteid":27,"parentgroupid":43,"sitename":"NoDef", ...}
			]}
	]


