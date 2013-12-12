/**
 * Created by slee on 2013. 12. 2..
 */

/**
 * Texas Hold'em 포커에서 팟을 처리하는 클래스
 * 기능
 *  - 플레이어들의 배팅(레이즈, 콜)한 칩을 모아둔다.
 *  - 플레이어가 폴드한 경우 저장해 둔다.
 *  - 올인 플레이어가 있을 경우 팟을 분리한다.(Main -> ... Side-1 -> Side-0)
 *
 * @param app
 * @constructor
 */
var Pot = function() {
    this.reset();
};

module.exports = Pot;

var pot = Pot.prototype;

/**
 * Side 팟을 포함한 모든 팟의 정보를 배열에 나열한다.
 * @param pots 팟정보들의 배열
 */
pot.pots = function (pots) {
    if (this.sidePot != null) {
        this.sidePot.pots(pots);
    }

    pots.push(this.info());
};

/**
 * 팟의 기본 정보를 얻는다.
 * @returns {{betChip: *, betters: *, folders: *, alliners: *}}
 */
pot.info = function () {
    return {
        betChip: this.betChip,
        betters: JSON.parse(JSON.stringify(this.betters)),
        folders: JSON.parse(JSON.stringify(this.folders)),
        alliners: JSON.parse(JSON.stringify(this.alliners))
    };
};

/**
 * 팟의 모든 정보를 초기화한다.
 */
pot.reset = function () {
    this.sidePot = null; // 팟이 분리가 있을 경우 이전 팟의 링크

    this.betters = {}; // 베팅한 플레이어 객체({id: betChip}) 리스트
    this.folders = {}; // 폴드한 플레이어 객체({id: betChip}) 리스트
    this.alliners = []; // 올인한 플레이어 ID 리스트

    this.betChip = 0; // 현재 플레어어들이 베팅한 최고 칩 수
};

/**
 * 콜하기 위해 요구되는 칩 수
 * @param id
 * @returns {number}
 */
pot.requireChipForCall = function (id) {
    var chip = 0;
    if (this.better[id]) {
        chip = this.betChip - this.better[id].betChip;
    }
    else {
        chip = this.betChip;
    }

    console.log('플레어어 %j 이 콜하기 위해서 필요한 칩은 %j이다.', id, chip);
    return chip;
};

/**
 * 베팅 처리
 * @param id
 * @param chip
 */
pot.bet = function (id, chip, allinFlag) {
    if (this.betters[id] === undefined) {
        this.betters[id] = 0;
    }
    this.betters[id] += chip;

    if (allinFlag) {
        if (this.alliners.indexOf(id) === -1) {
            console.log("플레이어 %j 가 올인 플레이어에 추가됨.", id);
            this.alliners.push(id);
        }
    }

    this.betChip += chip;

    console.log('플레이어 %j 이 %j 를 베팅함. (allin=%j)', id, chip, allinFlag);
};

/**
 * 레이즈 처리
 * @param id
 * @param chip
 * @param allinFlag
 */
pot.raise = function (id, chip, allinFlag) {
    if (this.betters[id] === undefined) {
        this.betters[id] = 0;
    }

    // 현재 베팅한 칩과 레이즈할 칩의 합이 팟의 베팅칩보다 커야한다.
    if (this.betters[id] + chip > this.betChip) {
        this.betters[id] += chip;
    }
    else {
        return -1;
    }

    if (allinFlag) {
        if (this.alliners.indexOf(id) === -1) {
            console.log("플레이어 %j 가 올인 플레이어에 추가됨.", id);
            this.alliners.push(id);
        }
    }

    // 레이즈한 플레이어의 베팅칩이 팟의 베팅칩이 된다.
    this.betChip = this.betters[id];

    console.log('플레이어 %j 이 %j 만큼 레이즈함. (allin=%j)', id, chip, allinFlag);

    return 0;
};

/**
 * 콜 처리
 * @param id
 * @param allinFlag
 */
pot.call = function (id, chip, allinFlag) {
    var callChip = 0;
    if (this.betters[id]) {
        callChip = this.betChip - this.betters[id];
    }
    else {
        callChip = this.betChip;
        this.betters[id] = 0;
    }

    if (chip === 0) {
        chip = callChip;
        this.betters[id] = this.betChip;
    }
    else {
        this.betters[id] += chip;
    }

    if (allinFlag) {
        if (this.alliners.indexOf(id) === -1) {
            console.log("플레이어 %j 가 올인 플레이어에 추가됨.", id);
            this.alliners.push(id);
        }
    }

    console.log('플레이어 %j 이 %j / %j 만큼 콜함. (allin=%j)', id, chip, callChip, allinFlag);
};

/**
 * 폴드 처리
 * @param id
 */
pot.fold = function (id) {
    if (this.betters[id]) {
        // 베팅한 기록이 있는 경우 베팅 플레이어 리스트에서 제거하고 기존 베팅 금액을 기록해 둔다.
        this.folders[id] = this.betters[id];
        delete this.betters[id];
    }
    else {
        // 베팅한 기록이 없는 경우 폴드 플레이어 리스트에만 추가한다.(베팅 금액은 0 이다)
        this.folders[id] = 0;
    }

    console.log('플레이어 %j 이 폴드함.', id);
}

/**
 * 올인 플레이어가 있고 올인 플레이어의 베팅 금액이 팟의 베팅금액보다 작은 경우
 * Main팟과 마지막 Side팟 사이에 새로운 Side팟을 생성해서 링크한다.
 */
pot.split = function () {
    while (this.alliners.length > 0) {
        var minBet = this.betChip;
        for (var i=0; i<this.alliners.length; i++) {
            if (this.betters[this.alliners[i]] < minBet) {
                minBet = this.betters[this.alliners[i]];
            }
        }

        // 최소 베팅칩이 베팅칩과 같으면 팟을 분리하지 않는다.
        if (minBet === this.betChip) {
            break;
        }

        // Side 팟의 링크 설정
        var sidePot = new Pot(this.app);
        sidePot.sidePot = this.sidePot;
        this.sidePot = sidePot;

        sidePot.betChip = minBet;
        this.betChip -= minBet;

        for (var id in this.betters) {
            sidePot.betters[id] = minBet;
            this.betters[id] -= minBet;

            // Side 팟의 올인 플레이어에 추가하고 현재 올인 플레이어에서는 삭제
            for (var i=0; i<this.alliners.length; i++) {
                if (this.alliners[i] == id && this.betters[id] === 0) {
                    sidePot.alliners.push(id);
                    this.alliners.splice(i,1);
                    delete this.betters[id];
                    break;
                }
            }
        }

        console.log('메인 팟에서 Side 팟 (%j) 이 분리됨.', JSON.stringify(sidePot.info()));
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test
if (process.env.UNITTEST === 'true') {
    var assert = require("assert");

    describe('Pot', function(){
        var PLAYER_1 = "1";
        var PLAYER_2 = "2";
        var PLAYER_3 = "3";

        describe('bet()', function(){
            var testPot = new Pot();

            testPot.bet(PLAYER_1, 5, false);

            it('베터의 칩과 팟의 베팅 칩이 베팅한 칩으로 설정되어야 한다.', function(){
                assert.equal(5, testPot.betters[1]);
                assert.equal(5, testPot.betChip);
            });
        });

        describe('call()', function(){
            var testPot = new Pot();

            testPot.bet(PLAYER_1, 5, false);
            testPot.call(PLAYER_2, 0, true);

            it('콜한 플레이어의 칩이 팟의 베팅 칩과 같아야한다.', function(){
                assert.equal(5, testPot.betters[1]);
                assert.equal(5, testPot.betChip);
            });

            it('플레이어가 올인 했을 경우 올인리스트에 추가되어야 한다.', function(){
                assert.equal(1, testPot.alliners.length);
            });
        });

        describe('fold()', function(){
            var testPot = new Pot();

            testPot.bet(PLAYER_1, 5, false);
            testPot.fold(PLAYER_2);

            it('플레이어가 폴드 했을 경우 폴드 리스트에 추가되어야 한다.', function(){
                assert.equal(0, testPot.folders[PLAYER_2]);
            });
        });

        describe('split()', function(){
            var testPot = new Pot();

            testPot.bet(PLAYER_1, 5, false);
            testPot.call(PLAYER_3, 0, false);

            it('올인한 플레이어가 없을 경우 팟이 분리되지 말어야 한다.', function(){
                testPot.split();
                assert.equal(0, testPot.alliners.length);
                assert.equal(null, testPot.sidePot);
                assert.equal(5, testPot.betChip);
                var pots = [];
                testPot.pots(pots);

                assert.equal('[{"betChip":5,"betters":{"1":5,"3":5},"folders":{},"alliners":[]}]',
                    JSON.stringify(pots))
            });

            it('올인한 플레이어가 있지만 베팅 긍액이 같을 경우 팟이 분리되지 않아야 한다.', function(){
                testPot.call(PLAYER_2, 0, true);

                testPot.split();
                assert.equal(1, testPot.alliners.length);
                assert.equal(null, testPot.sidePot);
                assert.equal(5, testPot.betChip);
                var pots = [];
                testPot.pots(pots);

                assert.equal('[{"betChip":5,"betters":{"1":5,"2":5,"3":5},"folders":{},"alliners":["2"]}]',
                    JSON.stringify(pots))
            });
        });

        describe('split() 2', function(){
            var testPot = new Pot();

            testPot.bet(PLAYER_1, 5, false);
            testPot.call(PLAYER_2, 4, true);
            testPot.call(PLAYER_3, 3, true);

            it('올인한 플레이어가 여러 명일 경우 팟이 여러 번 분리되어야 한다.', function(){
                testPot.split();
                assert.equal(0, testPot.alliners.length);
                assert.equal(1, testPot.sidePot.alliners.length);
                assert.equal(1, testPot.betChip);
                assert.equal(1, testPot.sidePot.betChip);
                assert.equal(3, testPot.sidePot.sidePot.betChip);
                var pots = [];
                testPot.pots(pots);

                assert.equal('[{"betChip":3,"betters":{"1":3,"2":3,"3":3},"folders":{},"alliners":["3"]},{"betChip":1,"betters":{"1":1,"2":1},"folders":{},"alliners":["2"]},{"betChip":1,"betters":{"1":1},"folders":{},"alliners":[]}]',
                    JSON.stringify(pots))
            });
        });
    });
}
