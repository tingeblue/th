var pomelo = require('pomelo');
var dispatcher = require('./app/util/dispatcher');
var abuseFilter = require('./app/servers/chat/filter/abuseFilter');
var timeReport = require('./app/modules/timeReport');

// route definition for chat server
var chatRoute = function(session, msg, app, cb) {console.log('App.chatRoute()');
  var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('rid'), chatServers);
    console.log(res);
	cb(null, res.id);
};


/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo-websocket');

// app configuration
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 3,
     
      // enable useDict will make route to be compressed 
      useDict: true,

      // enable useProto
      useProtobuf: true 
		});
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useDict: true,

            // enable useProto
            useProtobuf: true
		});
});

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', chatRoute);
    app.filter(pomelo.timeout());
});

app.configure('production|development', 'chat', function() {
  app.filter(abuseFilter());
});

app.configure('production|development', function() {
    // route configures
    app.route('game', gameRoute);
    app.filter(pomelo.timeout());
});

//app.registerAdmin(timeReport, {app: app});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});
