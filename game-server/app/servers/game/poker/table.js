var Turn = require('./turn');
var Pot = require('./pot');
var Step = require('./step');
var Player = require('./player');
/**
 * Created by slee on 2013. 12. 2..
 */
var Table = function () {
    this.turn = new Turn();
    this.pot = new Pot();
    this.step = new Step();

    this.players = {};

    // 스텝 진행에 따른 처리함수 등록
    this.step.register(Step.READY, this.ready);
    this.step.register(Step.PREFLOP, this.preflop);
    this.step.register(Step.FLOP, this.flop);
    this.step.register(Step.TURN, this.turn);
    this.step.register(Step.RIVER, this.river);
    this.step.register(Step.SHOWDOWN, this.showdown);
};

var table = Table.prototype;

/**
 * 모든 플레이어들을 내보낸다.
 */
table.kickAll = function () {
    for (var id in this.players) {
        this.players[id].kick();
    }

    // 모든 플레이어에게 통보

    // 플레이어들을 모두 삭제함.
    this.players = {};
};

/**
 * 플레이어가 방에 들어온다.
 * @param uid
 * @returns {number}
 */
table.enter = function (uid) {
    if (this.players[uid]) {
        return -1;
    }

    // 플레이어 리스트에 추가
    this.players[uid] = new Player(uid);

    // 다른 플레이어들에게 입장을 알림


    console.log('플레이어 %j 가 방에 들어옴.', uid);

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

        // 다른 플레이어에게 퇴장을 알림.

        // 플레이어 리스트에서 삭제
        delete this.players[uid];

        console.log('플레이어 %j 가 방에서 떠남.', uid);
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
            console.log()
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
        var res;
        switch (data.action) {
            case Player.ACTION_BET:
                break;
            case Player.ACTION_RAISE:
                break;
            case Player.ACTION_CALL:
                break;
            case Player.ACTION_CHECK:
                break;
            case Player.ACTION_FOLD:
                break;
            default :
                console.log('알 수 없는 액션 요청입니다. (%j)', data.action);
                return -1;
        }

        if (res === 0) {
            if (this.turn.isTurnLast()) {
                this.step.proceedNext();
            }
        }

        return 0;
    }

    return -1;
};


table.ready = function () {

};

table.preflop = function () {

};

table.flop = function () {

};

table.turn = function () {

};

table.river = function () {

};

table.showdown = function () {

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
                tables[rid].enter(rid, uid);
            }
        },

        leave: function (rid, uid) {
            if (tables[rid]) {
                tables[rid].leave(rid, uid);
            }
        },

        request: function (app, msg, session) {
            var rid = session.get('rid');
            if (tables[rid]) {
                switch (msg.payload.method) {
                    case 'remove':
                        tables[rid].kickAll();
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
                    tables[rid].enter(msg.uid);
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

///////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test
var assert = require("assert");

describe('Turn', function(){
    var PLAYER_1 = "1";
    var PLAYER_2 = "2";
    var PLAYER_3 = "3";

    // 두명으로 기본 플레이
    describe('basic play', function(){
        var table = new Table();
        table.enter(PLAYER_1);
        table.enter(PLAYER_2);
        table.seat(PLAYER_1, 1);
        table.seat(PLAYER_1, 2);

        it('자리에 플레이어들을 추가/삭제 시 -1이 아니어야 한다.', function(){

        });
    });

    // 두명의 플레이하고 체크로 넘어가는 경우

    // 두명이 플레이중 한명이 Fold한 경우

    // 두명이 플레이중 한명이 올인한 경우(Raise)

    // 두명이 플레이중 한명이 올인한 경우(Call)
});