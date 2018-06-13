
// Created by steve on 2017/4/25.

var g_oxGameLogic = null;
var OxGameLogic = cc.Class({
    ctor:function(){},

    // 获取数值
    GetCardValue: function(cbCardData) { return cbCardData&0x0F; },

    // 获取花色
    GetCardColor:function(cbCardData) { return (cbCardData&0xF0)>>4; },

    // 逻辑数值
    GetCardLogicValue:function(cbCardData) {
        // 扑克属性
        var bCardColor = cc.OxGameLogic.GetCardColor(cbCardData);
        var bCardValue = cc.OxGameLogic.GetCardValue(cbCardData);

        // 转换数值
        return (bCardValue>10)?(10):bCardValue;
    },

    // 排列扑克
    SortCardList: function(cbCardData, cbCardCount) {
        // 转换数值
        var cbLogicValue = [];
        for (var i = 0; i < cbCardCount; ++i) cbLogicValue[i] = cc.OxGameLogic.GetCardValue(cbCardData[i]);

        // 排序操作
        var bSorted = true;
        var cbTempData;
        var bLast = cbCardCount - 1;
        do {
            bSorted = true;
            for (var i = 0; i < bLast; ++i) {
                if ((cbLogicValue[i] < cbLogicValue[i+1]) ||
                    ((cbLogicValue[i] == cbLogicValue[i+1]) && (cbCardData[i] < cbCardData[i+1]))) {
                    // 交换位置
                    cbTempData = cbCardData[i];
                    cbCardData[i] = cbCardData[i+1];
                    cbCardData[i+1] = cbTempData;
                    cbTempData = cbLogicValue[i];
                    cbLogicValue[i] = cbLogicValue[i+1];
                    cbLogicValue[i+1] = cbTempData;
                    bSorted = false;
                }
            }
            bLast--;
        } while (bSorted == false);
        
        return cbCardData;
    },

    // 获取牌的类型, 有牛几 or 没牛
    GetCardType: function(cbCardData, cbCardCount) {
        var bTemp = [];
        var bSum = 0;

        for (var i = 0; i < cbCardCount; ++i) {
            bTemp[i] = cc.OxGameLogic.GetCardLogicValue(cbCardData[i]);
            bSum += bTemp[i];
        }

        for (var i = 0; i < cbCardCount-1; ++i) {
            for (var j = i+1; j < cbCardCount; ++j) {
                if ((bSum - bTemp[i] - bTemp[j]) % 10 == 0) {
                    return [((bTemp[i] + bTemp[j]) > 10) ? (bTemp[i] + bTemp[j] - 10) : (bTemp[i] + bTemp[j]), i, j];
                }
            }
        }

        return [OX_VALUE0, -1, -1];
    },
});

OxGameLogic.getInstance = function(){
    if(g_oxGameLogic == null){
        g_oxGameLogic = new OxGameLogic();
    }
    return g_oxGameLogic;
}
module.exports = OxGameLogic;
