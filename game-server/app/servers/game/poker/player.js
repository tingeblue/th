/**
 * Created by slee on 2013. 12. 5..
 */

/**
 * 턴을 관리하는 클래스
 * 기능
 *  - 플레이어들의 자리를 관리한다.
 *  - 딜러의 위치를 처리한다.
 *  - 턴 진행을 처리한다. (턴의 마지막을 확인)
 * @constructor
 */
var Player = function(uid) {
    this.uid = uid;
    this.chip = 0;

    this.reset();
};

module.exports = Player;

/**
 * 액션 정의
 * @type {string}
 */
Player.ACTION_NONE = 'none';
Player.ACTION_BET = 'bet';
Player.ACTION_RAISE = 'raise';
Player.ACTION_CALL = 'call';
Player.ACTION_CHECK = 'check';
Player.ACTION_FOLD = 'fold';
Player.ACTION_ALLIN = 'allin';

var player = Player.prototype;

/**
 * 모두 초기값으로 되돌린다.
 */
player.reset = function () {
    this.action = Player.ACTION_NONE;
};

/**
 * 방에서 내보내짐(방이 삭제된 경우)
 */
player.kick = function () {
    this.reset();
};

/**
 * 올인 여부 확인
 * @param chip
 * @returns {boolean}
 */
player.isAllin = function (chip) {
    if (this.chip - chip > 0) {
        return false;
    }

    return true;
};

/**
 * 칩을 추가 구매함.
 * @param chip
 */
player.buyChip = function (chip) {
    this.chip += chip;

    console.log('플레이어 %j 가 %j 만큼 칩을 구매해서 %j 가 됨.', this.uid, chip, this.chip);
};

/**
 * 베팅을 위해 칩을 사용함.
 * @param chip
 * @returns {number}
 */
player.betChip = function (chip) {
    if (chip > this.chip) {
        return -1;
    }

    this.chip -= chip;
    console.log('플레이어 %j 가 %j 만큼 칩을 사용해서 %j 가 남음.', this.uid, chip, this.chip);
};

/**
 * 승자 배당 칩을 받음.
 * @param chip
 */
player.winChip = function (chip) {
    this.chip += chip;

    console.log('플레이어 %j 가 %j 만큼 칩을 획득해서 %j 가 됨.', this.uid, chip, this.chip);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test
if (process.env.UNITTEST === 'true') {
    var assert = require("assert");

    describe('Player', function(){
        var p = new Player('1');

        describe('buyChip()', function(){
            it('추가된 칩이 정확해야 한다.', function(){
                p.buyChip(5);
                assert.equal(5, p.chip);
            });
        });

        describe('betChip()', function(){
            it('스텝 진행이 정확해야 한다.', function(){
                p.betChip(3);
                assert.equal(2, p.chip);
            });
        });

        describe('winChip()', function(){
            it('스텝 진행이 정확해야 한다.', function(){
                p.winChip(5);
                assert.equal(7, p.chip);
            });
        });

        describe('action()', function(){
            it('스텝 진행이 정확해야 한다.', function(){
            });
        });
    });
}
