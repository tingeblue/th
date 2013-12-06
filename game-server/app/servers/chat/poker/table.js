/**
 * Created by slee on 2013. 12. 2..
 */
var Table = function () {
    this.turn = require('./turn');
    this.pot = require('./pot');
    this.players = {};
};

/**
 * 스텝 정의
 * @type {string}
 */
Table.STEP_READY = 'ready';
Table.STEP_PREFLOP = 'preflop';
Table.STEP_FLOP = 'flop';
Table.STEP_TURN = 'turn';
Table.STEP_RIVER = 'river';
Table.STEP_SHOWDOWN = 'showdown';


var table = Table.prototype;

/**
 * 플레이어가 방에 들어온다.
 * @param uid
 * @returns {number}
 */
table.enter = function (uid) {
    if (this.players[uid]) {
        return -1;
    }

    this.players[uid] = require('./player')(uid);

    return 0;
};

/**
 * 플레이어가 방에서 떠난다.
 * @param uid
 * @returns {number}
 */
table.leave = function (uid) {
    if (this.players[uid]) {
        this.turn.unseat(uid);

        delete this.players[uid];
        return 0;
    }

    return -1;
};

/**
 * 자리에 새로운 플레이어가 앉는다.
 * @param uid
 * @param seatNum
 * @returns {number}
 */
table.seat = function (uid, seatNum) {
    if (this.players[uid]) {
        if (this.turn.add(uid, seatNum) === 0) {
            return 0;
        }
    }

    return -1;
};

/**
 * 플레이어가 자리에서 일어난다.
 * @param uid
 * @returns {number}
 */
table.unseat = function (uid) {
    if (this.players[uid]) {
        if (this.turn.remove(uid) === 0) {
            return 0;
        }
    }

    return -1;
};

/**
 * 플레이어의 액션을 처리한다.
 * @param uid
 * @param data
 * @returns {number}
 */
table.action = function (uid, data) {
    var player = this.players[uid];
    if (player) {
        switch (data.action) {
            case Table.ACTION_BET:
                break;
            case Table.ACTION_RAISE:
                break;
            case Table.ACTION_CALL:
                break;
            case Table.ACTION_CHECK:
                break;
            case Table.ACTION_FOLD:
                break;
            default :
                console.log('알 수 없는 액션 요청입니다. (%j)', data.action);
                return -1;
        }

        return 0;
    }

    return -1;
};

/**
 * Table 리스트를 관리하는 클래스
 * 기능
 *  - 테이블 생성, 삭제를 처리한다.
 *  - 플레이어를 테이블에 앉히거나 내보낸다.
 *  - 플레이어의 액션을 테이블에 전달한다.
 */
module.exports = (function () {
    var tables = {};

    return {
        enter: function (rid, uid) {
            if (tables[rid]) {

            }
        },

        leave: function (rid, uid) {

        },

        request: function (app, msg, session) {
            var rid = session.get('rid');
            if (tables[rid]) {
                switch (msg.payload.method) {
                    case 'remove':
                        delete tables[rid];
                    case 'seat':
                        tables[rid].seat(session.uid, msg.payload.data.seat);
                        break;
                    case 'unseat':
                        tables[rid].unseat(session.uid);
                        break;
                    case 'action':
                        tables[rid].action(session.uid, msg.payload.data);
                        break;
                    default :
                        console.log('알수 없는 테이블 메소드입니다. (%j)', msg.payload.method);
                        return -1; // unknown method
                }
            }
            else {
                if (msg.payload.method === 'create') {
                    tables[rid] = new Table();
                }
                else {
                    console.log('해당 테이블이 존재하지 않습니다. (%j)', rid);
                    return -1;
                }
            }

            return 0;
        }
    }
})();
