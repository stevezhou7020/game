cc.Class({
    extends: cc.Component,

    properties: {
        currIdx: {
            default: 1,
            visible: false,
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame
    // update: function (dt) {

    // },

    onBtnNumClicked: function(event, customEventData) {
        // 回退一个
        if (customEventData == -1) {
            if (this.currIdx > 1) {
                this.currIdx--;
                var lable = cc.find("tiaos/" + this.currIdx + "/num", this.node);
                lable.getComponent(cc.Label).string = "";
            }
        }
        // 清空重输
        else if (customEventData == -2) {
            while (this.currIdx > 1) {
                this.currIdx--;
                var lable = cc.find("tiaos/" + this.currIdx + "/num", this.node);
                lable.getComponent(cc.Label).string = "";
            }
        }
        // 输入一个
        else {
            if (this.currIdx < 7) {
                var lable = cc.find("tiaos/" + this.currIdx + "/num", this.node);
                lable.getComponent(cc.Label).string = customEventData;
                this.currIdx++;
            }
        }
    },

    getNumber: function() {
        var numTex = "";
        for (var i = 1; i < this.currIdx; ++i) {
            numTex += cc.find("tiaos/" + i + "/num", this.node).getComponent(cc.Label).string;
        }

        var number = parseInt(numTex);
        if (!number) number = 0;
        return number;
    }
});
