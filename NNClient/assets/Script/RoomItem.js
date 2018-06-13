
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            var agent = anysdk.agentManager;
            this.share_plugin = agent.getSharePlugin();
        }
    },
    
    set: function (data) {
        this.data = {};
        this.data.roomNum = data.roomNum;
        this.data.roomType = data.roomType;
        this.data.difen = data.difen;
        this.data.jushu = data.jushu;
        this.data.playerMax = data.playerMax;
        this.data.playerJoinNum = data.playerJoinNum;
        
        var txt1 = cc.find("btn/room/txt1", this.node).getComponent(cc.Label);
        var txt2 = cc.find("btn/room/txt2", this.node).getComponent(cc.Label);
        var txt3 = cc.find("btn/room/txt3", this.node).getComponent(cc.Label);
        var txt4 = cc.find("btn/room/txt4", this.node).getComponent(cc.Label);
        txt1.string = data.roomNum + "";
        txt2.string = data.difen + "";
        txt3.string = data.jushu + "";
        txt4.string = data.playerJoinNum + "/" +data.playerMax;
    },

    onBtnClicked: function() {
        if (this.data) {
            var num = this.data.roomNum;
            if (num && num >= 100000) {
                cc.GamePrivateMsg.sendJoinPrivate(num);
                cc.GamePrivateMsg.sendSitDownPrivate(num);
            }
        }
    },

    onYaoQingClicked: function() {
        if (this.data) {
            var num = this.data.roomNum;
            if (num && num >= 100000) {
                if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {    
                    var _title = "霸王牛牛【房间号：" + this.data.roomNum + "】";
                    var _text;

                    // 通比牛牛
                    if (this.data.roomType == 1) {
                        _text = "通比牛牛，";
                        _text += this.data.jushu + "局，";
                        _text += "底分"
                        _text += this.data.difen;
                    }
                    // 牛牛
                    else if (this.data.roomType == 0) {
                        _text = "牛牛，";
                        _text += this.data.jushu + "局，";
                        _text += "底分"
                        _text += this.data.difen;
                    }
                    // 转转牛牛
                    else {
                        _text = "转转牛牛，";
                        _text += "轮庄，";
                        _text += "底分"
                        _text += this.data.difen;
                    }

                    _text += "。让我们霸起来！";

                    var realUrl = cc.url.raw("resources/icon.png");
                    var map = {
                        title: _title,
                        text: _text,
                        url: "http://fir.im/42cj",
                        mediaType: '2',
                        shareTo: '0',
                        imagePath: realUrl,
                        thumbSize: '64',
                        thumbImage: ''
                    };
                    this.share_plugin.share(map);
                }
            }
        }
    },
});
