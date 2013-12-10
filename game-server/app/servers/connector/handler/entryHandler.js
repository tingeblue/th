var sha1 = require('sha1');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {console.log('EntryHandler()');
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {console.log('EntryHandler.enter(): msg=' + msg + ', session=' + session);
	var self = this;
    var rid = '';
    if (msg.hostFlag == 1) {
        var key = sha1(Math.floor(Math.random() * 100000));
        rid = key.substr(0,4);
    }
    else {
        rid = msg.rid;
    }

	var uid = msg.username + '*' + rid
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	//put user into channel
	self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
		next(null, {
            rid:rid,
			users:users
		});
	});

    //put user into game channel
    self.app.rpc.game.gameRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
        next(null, {
            rid:rid,
            users:users
        });
    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {console.log('EntryHandler.onUserLeave(): session=' + session);
	if(!session || !session.uid) {
		return;
	}
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);

    app.rpc.game.gameRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};