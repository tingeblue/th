/**
 * Created by slee on 2013. 12. 2..
 */

/**
 * 턴을 관리하는 클래스
 * 기능
 *  - 플레이어들의 자리를 관리한다.
 *  - 딜러의 위치를 처리한다.
 *  - 턴 진행을 처리한다. (턴의 마지막을 확인)
 * @constructor
 */
var Turn = function() {
    this.seats = {};

    this.reset();
};

module.exports = Turn;

/**
 * 자리의 수 (설정으로 빼는 것도 고려)
 */
var MAX_SEAT = 8;

var turn = Turn.prototype;

/**
 * 자리 수를 얻는다.
 * @returns {number}
 */
turn.maxSeatNums = function () {
    return MAX_SEAT;
};

/**
 * 자리에 앉은 플레이어 수를 얻는다.
 * @returns {number}
 */
turn.onSeatNums = function () {
    var n = 0;
    for (var i=0; i<MAX_SEAT; i++) {
        if (this.seats[i] !== null) {
            n++;
        }
    }
    return n;
};

/**
 * 모든 값들을 초기값으로 되돌린다.
 */
turn.reset = function () {
    for (var i=0; i<MAX_SEAT; i++) {
        this.seats[i] = null;
    }
    this.dealer = -1;
    this.turn = -1;
    this.laster = -1;
    this.smallBlind = -1;
    this.bigBlind = -1;

    console.log('턴과 관련된 모든 값들을 초기화 함.');
};

/**
 * 딜러를 다음 자리로 변경한다.
 * (딜러 다음 자리가 다음 턴(시작) 위치가 되고
 * 딜러가 마지막(laster) 위치가 됨, 단 Raise가 있을 시에는 laster가 변경됨)
 * @returns {number}
 */
turn.rotateDealer = function () {
    this.dealer = this.next(this.dealer);
    if (this.dealer === -1) {
        console.log('플레이어가 없습니다.');
        return -1;
    }
    this.turn = this.next(this.dealer);
    this.laster = this.dealer;

    console.log('다음 딜러는 %j 이다. (턴은 %j, 라스터는 %j)', this.dealer, this.turn, this.laster);

    return this.dealer;
};

/**
 * Blind Betting을 위한 자리를 설정한다.
 */
turn.setBlind = function () {
    if (this.onSeatNums() < 2) {
        console.log('자리에 앉은 플레이어 수가 모자란다.(2명 이상이어야 함)');
        return -1;
    }

    this.smallBlind = this.next(this.dealer);
    this.bigBlind = this.next(this.smallBlind);

    console.log('스몰 블라이드는 %j 이고 빅 블라인드는 %j 이다.', this.smallBlind, this.bigBlind);

    return 0;
};

/**
 * 마지막 턴 위치를 설정한다.
 * @param id
 * @returns {number}
 */
turn.setLaster = function (id) {
    for (var i=0; i<MAX_SEAT; i++) {
        if (this.seats[i] === id) {
            this.laster = i;
            console.log('%j 자리의 플레이어가 라스터가 됨.', i);
            return 0;
        }
    }

    return -1;
};

/**
 * 턴이 마지막(laster)까지 왔는지 확인한다.(laster가 액션을 하면 턴이 종료한다.)
 * 액션을 처리하고 난 뒤 확인해봐야 한다.
 * @returns {boolean}
 */
turn.isTurnLast = function () {
    if (this.turn === this.laster) {
        console.log('현재 턴인 %j 자리의 플레이어가 턴의 마지막 임.', this.turn);
        return true;
    }

    console.log('아직 턴의 마지막이 아님.');
    return false;
};

/**
 * 다음 턴으로 진행한다.
 * @returns {number}
 */
turn.proceedTurn = function () {
    this.turn = this.next(this.turn);
    console.log('다음 자리 %j 로 턴이 이동함.', this.turn);
    return this.turn;
}

/**
 * 지정된 자리에 플레이어를 앉힌다.
 * @param id
 * @param seat
 * @returns {number}
 */
turn.add = function (id, seat) {
    if (this.seats[seat] !== null) {
        // 이미 자리에 앉은 플레이가 있다.
        console.log('%j 자리에는 이미 플레이어가 앉아 있음.', seat);
        return -1;
    }

    this.seats[seat] = id;

    // 두번째 플레이어이면 턴으로 설정
    if (this.dealer !== -1 && this.turn === -1) {
        this.turn = seat;
    }

    // 아직 딜러가 정해져 있지 않으면 최초로 추가된 플레이어가 딜러가 된다.
    if (this.dealer === -1) {
        this.dealer = seat;
        this.laster = seat;
    }

    console.log('%j 자리에 플레이어 %j 가 앉음.', seat, id);

    return 0;
};

/**
 * 플레이어를 찾아서 자리에서 삭제한다.
 * @param id
 * @returns {number}
 */
turn.remove = function (id) {
    var seat = this.find(id);
    if (seat === -1) {
        return -1;
    }

    this.seats[seat] = null;

    // 삭제될 플레이어가 laster일 경우 이전 자리로 laster를 이동 시킨다.
    if (seat === this.laster) {
        this.laster = this.prev(seat);
    }

    // 삭제될 플레이어가 딜러인 경우 딜러를 이동 시킨다.
    if (seat === this.dealer) {
        this.dealer = this.next(seat);
    }

    // 삭제될 플레이어가 턴인 경우 다음 턴으로 진행한다.
    if (seat === this.turn) {
        this.proceedTurn();
    }

    console.log('%j 자리의 플레이어 %j 가 자리에서 떠남.', seat, id);

    return 0;
};

/**
 * 플레이어의 자리를 찾음.
 * @param id
 * @returns {number}
 */
turn.find = function (id) {
    for (var i=0; i<MAX_SEAT; i++) {
        if (this.seats[i] === id) {
            return i;
        }
    }

    return -1;
};

/**
 * 해당 자리의 다음 자리를 얻는다.
 * @param prevSeat
 * @returns {*}
 */
turn.next = function (prevSeat) {
    var seat = prevSeat;
    do {
        seat++;
        if (seat >= MAX_SEAT) {
            seat = 0;
        }

        if (this.seats[seat] !== null) {
            return seat;
        }
    }
    while (seat !== prevSeat);

    return -1;
};

/**
 * 해당 위치의 이전 자리를 얻는다.
 * @param prevSeat
 * @returns {*}
 */
turn.prev = function (prevSeat) {
    var seat = prevSeat;
    do {
        seat--;
        if (seat < 0) {
            seat = MAX_SEAT - 1;
        }

        if (this.seats[seat] !== null) {
            return seat;
        }
    }
    while (seat !== prevSeat);

    return -1;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test
if (process.env.UNITTEST === 'true') {
    var assert = require("assert");

    describe('Turn', function(){
        var PLAYER_1 = "1";
        var PLAYER_2 = "2";
        var PLAYER_3 = "3";

        describe('add() & remove()', function(){
            var turn = new Turn();
            it('자리에 플레이어들을 추가/삭제 시 -1이 아니어야 한다.', function(){
                assert.equal(0, turn.add(PLAYER_1, 2));
                assert.equal(PLAYER_1, turn.seats[2]);
                assert.equal(2, turn.dealer);
                assert.equal(2, turn.laster);
                assert.equal(0, turn.remove(PLAYER_1));
                assert.equal(null, turn.seats[2]);
                assert.equal(-1, turn.dealer);
                assert.equal(-1, turn.laster);

            });
        });

        describe('next() & prev()', function(){
            var turn = new Turn();
            it('다음/이전 자리이 확인이 맞아야 한다.', function(){
                assert.equal(0, turn.add(PLAYER_1, 2));
                assert.equal(0, turn.add(PLAYER_2, 4));
                assert.equal(0, turn.add(PLAYER_3, 5));

                assert.equal(4, turn.next(2));
                assert.equal(5, turn.prev(2));
                assert.equal(4, turn.prev(5));
                assert.equal(2, turn.prev(4));
            });
        });

        describe('rotateDealer()', function(){
            var turn = new Turn();
            it('현제 딜러의 다음 자리가 딜러가 되어야 한다.', function(){
                assert.equal(0, turn.add(PLAYER_1, 2));
                assert.equal(0, turn.add(PLAYER_2, 3));
                assert.equal(0, turn.add(PLAYER_3, 5));
                assert.equal(2, turn.dealer);
                assert.equal(3, turn.rotateDealer());
                assert.equal(3, turn.dealer);
            });
        });

        describe('proceedTurn() & isTurnLast()', function(){
            var turn = new Turn();
            it('턴 진행처리가 제대로 되어야 한다.', function(){
                assert.equal(0, turn.add(PLAYER_1, 2));
                assert.equal(0, turn.add(PLAYER_2, 3));
                assert.equal(0, turn.add(PLAYER_3, 5));

                assert.equal(2, turn.dealer);
                assert.equal(2, turn.laster);
                assert.equal(3, turn.turn);
                assert.equal(5, turn.proceedTurn());
                assert.ok(!turn.isTurnLast());
                assert.equal(2, turn.proceedTurn());
                assert.ok(turn.isTurnLast());
            });
        });
    });
}
