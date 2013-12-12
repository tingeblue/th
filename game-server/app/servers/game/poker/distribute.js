/**
 * Created by slee on 2013. 12. 5..
 */
module.exports = (function () {
    /**
     * 팟에서 칩이 분배될 Winner를 찾는다.
     * @param pot
     * @param winners
     * @returns {Array}
     */
    var findDistributers = function (pot, winners) {
        var distributers = [];
        for (var i=0; i<winners.length; i++) {
            if (pot.betters[winners[i]]) {
                distributers.push(winners[i]);
            }
        }

        console.log('팟의 분배자는 %j 들이다.', JSON.stringify(distributers));

        return distributers;
    };

    /**
     * 팟에 있는 총 칩수를 계산한다.
     * @param pot
     * @returns {number}
     */
    var caclChip = function (pot) {
        var chip = 0;
        for (var id in pot.betters) {
            chip += pot.betters[id];
        }

        for (var id in pot.folders) {
            chip += pot.folders[id];
        }

        console.log('팟의 전체 칩수는 %j 이다.', chip);

        return chip;
    };

    return {
        /**
         * 팟 정보와 승자 정보를 이용해서 칩 분배를 계산한다.
         * @param pots
         * @param winners
         * @returns {Array}
         */
        distribute: function (pots, winners) {
            var result = JSON.parse(JSON.stringify(pots));

            // 모든 팟들을 돌면서 각 팟의 Winner를 선정한다.
            for (var i=0; i<pots.length; i++) {
                result[i]['winners'] = {};

                // 승자 중에 해당 팟에서 칩을 얻는 플레이어가 있는지 확인한다. (1위에서 없으면 다음 등수로 진행한다.)
                for (var rank in winners) {
                    var distributers = findDistributers(pots[i], winners[rank]);
                    var chip = caclChip(pots[i]);

                    if (distributers.length > 0) { // 분배 받을 플레이어가 있는 경우
                        // 분배 받는 플레이어수로 나눈 나머지
                        var remainChip = chip % distributers.length;

                        // 분배 받는 플레이어수로 나눈 칩 수
                        chip = parseInt(chip / distributers.length);

                        // 분배 받는 플래어어와 칩 수를 추가한다.
                        for (var j=0; j<distributers.length; j++) {
                            result[i].winners[distributers[j]] = chip;
                        }

                        // 칩을 분배할 때 남는 칩은 첫번째 플레이어에게 준다.
                        result[i].winners[distributers[0]] += remainChip;

                        break;
                    }
                    else { // 분배 받을 플레이어가 없는 경우 베팅을 한 플레이어들이 나누어 가진다.
                        for (var j=0; j<pots[i].betters; j++) {
                            result[i].winners[j] = pots[i].betters[j];
                        }
                    }
                }
            }

            console.log('팟 분배 결과는 %j 이다.', JSON.stringify(result));

            return result;
        }
    };
})();


///////////////////////////////////////////////////////////////////////////////////////////////////
// Unit test
if (process.env.UNITTEST === 'true') {
    var assert = require("assert");

    describe('Distribute', function(){
        var dist = module.exports;

        describe('distribute()', function(){
            var pots = [{betChip:5,betters:{"1":5,"2":5,"3":5},folders:{},alliners:[]}];

            it('팟이 하나이고 승자가 하나 일때', function(){
                var winners = {1:["1"],2:["2","3"]};
                assert.equal(JSON.stringify(dist.distribute(pots, winners)), '[{"betChip":5,"betters":{"1":5,"2":5,"3":5},"folders":{},"alliners":[],"winners":{"1":15}}]');
            });

            it('팟이 하나이고 승자가 둘 일때', function(){
                var winners = {1:["1","2"],2:["3"]};
                assert.equal(JSON.stringify(dist.distribute(pots, winners)), '[{"betChip":5,"betters":{"1":5,"2":5,"3":5},"folders":{},"alliners":[],"winners":{"1":8,"2":7}}]');
            });
        });

        describe('distribute()', function(){
            var pots = [{betChip:5,betters:{"1":5,"2":5,"3":5},folders:{},alliners:["2"]},{betChip:2,betters:{"1":2,"3":2},folders:{},alliners:[]}];
            var winners = {1:["2"],2:["1"]};

            it('팟이 둘일 때(승자가 올인한 플레이어인 경우)', function(){
                assert.equal(JSON.stringify(dist.distribute(pots, winners)),
                    '[{"betChip":5,"betters":{"1":5,"2":5,"3":5},"folders":{},"alliners":["2"],"winners":{"2":15}},{"betChip":2,"betters":{"1":2,"3":2},"folders":{},"alliners":[],"winners":{"1":4}}]');
            });
        });

        describe('distribute()', function(){
            var pots = [{betChip:5,betters:{"1":5,"2":5,"3":5},folders:{},alliners:["2"]},{betChip:2,betters:{"1":2,"3":2},folders:{},alliners:[]}];
            var winners = {1:["1"],2:["2"]};

            it('승자가 올인한 플레이어가 아닌 경우', function(){
                assert.equal(JSON.stringify(dist.distribute(pots, winners)),
                    '[{"betChip":5,"betters":{"1":5,"2":5,"3":5},"folders":{},"alliners":["2"],"winners":{"1":15}},{"betChip":2,"betters":{"1":2,"3":2},"folders":{},"alliners":[],"winners":{"1":4}}]');
            });
        });

        describe('distribute()', function(){
            var pots = [{betChip:5,betters:{"1":5,"2":5},folders:{"3":0},alliners:["2"]},{betChip:2,betters:{"1":2},folders:{},alliners:[]}];
            var winners = {1:["1"],2:["2"]};

            it('폴드한 플레이어가 있는 경우', function(){
                assert.equal(JSON.stringify(dist.distribute(pots, winners)),
                    '[{"betChip":5,"betters":{"1":5,"2":5},"folders":{"3":0},"alliners":["2"],"winners":{"1":10}},{"betChip":2,"betters":{"1":2},"folders":{},"alliners":[],"winners":{"1":2}}]');
            });
        });
    });
}