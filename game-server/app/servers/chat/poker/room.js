/**
 * Created by slee on 2013. 12. 3..
 */
var table = require('./table');

module.exports = (function() {
    return {
        request: function (app, msg, session) {
            switch (msg.payload.method) {
                case 'enter':
                    app.rpc.chat.chatRemote.add(session, session.uid, app.get('serverId'), msg.payload.data.rid, true, function (users) {
                        table.enter(session.get('rid'), session.uid);
                    });
                    break;
                case 'leave': {
                    table.leave(session.get('rid'), session.uid);

                    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
                }
                    break;
                default :
                    break;
            }
        }
    };
})();