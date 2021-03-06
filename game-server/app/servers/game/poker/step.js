/**
 * Created by slee on 2013. 12. 10..
 */

/**
 * 스텝처리를 담당하는 클래스
 * 기능
 *  - 현재 스텝을 저장한다.
 *  - 다음 스텝으로 진행하고 처리함수를 호출한다.
 * @constructor
 */
var Step = function () {
    this.stepFn = {};

    this.step = Step.READY;
};

module.exports = Step;

/**
 * 스텝 정의
 * @type {string}
 */
Step.READY = 0;
Step.PREFLOP = 1;
Step.FLOP = 2;
Step.TURN = 3;
Step.RIVER = 4;
Step.SHOWDOWN = 5;

Step.STEP_STR = [
    'READY',
    'PREFLOP',
    'FLOP',
    'TURN',
    'RIVER',
    'SHOWDOWN'
];

var step = Step.prototype;

/**
 * 스텝처리 함수를 등록한다.
 * @param stepId
 * @param fn
 */
step.register = function (obj, stepId, fn) {
    this.stepFn[stepId] = function () {
        return fn && fn.apply(obj);
    };
};

step.start = function () {
    this.step = Step.READY;
    this.proceedNext();
};

/**
 * 다음 스템으로 진행한다.
 */
step.proceedNext = function () {
    this.step++;
    if (this.step > Step.SHOWDOWN) {
        this.step = Step.READY;
    }

    if (this.stepFn[this.step]) {
        console.log('다음 스텝 %j 를 시작한다.', Step.STEP_STR[this.step]);
        return this.stepFn[this.step]();
    }

    return -1;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test
if (process.env.UNITTEST === 'true') {
    var assert = require("assert");

    describe('Step', function(){
        var s = new Step();
        s.register(this, Step.READY, function () {
            console.log('Ready Step.');
            return Step.READY;
        });
        s.register(this, Step.PREFLOP, function () {console.log('PreFlop Step.'); return Step.PREFLOP;});
        s.register(this, Step.FLOP, function () {console.log('Flop Step.'); return Step.FLOP;});
        s.register(this, Step.TURN, function () {console.log('Turn Step.'); return Step.TURN;});
        s.register(this, Step.RIVER, function () {console.log('River Step.'); return Step.RIVER;});
        s.register(this, Step.SHOWDOWN, function () {console.log('Showdown Step.'); return Step.SHOWDOWN;});

        describe('register()', function(){
            it('각 함수가 등록되어 있어야 한다.', function(){
                for (var i=Step.READY; i<Step.SHOWDOWN+1; i++) {
                    var r = s.stepFn[i]();
                    assert.equal(i, r);
                }
            });
        });

        describe('nextStep()', function(){
            it('스텝 진행이 정확해야 한다.', function(){
                var i = Step.READY+1;
                while (Step.READY !== s.proceedNext()) {
                    assert.equal(i, s.step);
                    i++;
                }
            });
        });
    });
}