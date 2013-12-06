/**
 * Created by slee on 2013. 12. 5..
 */
module.exports = function(uid) {
    return new Player(uid);
};

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
    this.action = Player.ACTION_NONE;
};

/**
 * 액션 정의
 * @type {string}
 */
Player.ACTION_NONE = 'bet';
Player.ACTION_BET = 'bet';
Player.ACTION_RAISE = 'raise';
Player.ACTION_CALL = 'call';
Player.ACTION_CHECK = 'check';
Player.ACTION_FOLD = 'fold';
Player.ACTION_ALLIN = 'allin';

var player = Player.prototype;

