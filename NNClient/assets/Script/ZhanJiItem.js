cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.ZhanJiItem = this;
    },

    set: function(TotalRecord) {
        this.TotalRecord = TotalRecord;
        
        var shijian = this.node.getChildByName("shijian").getComponent(cc.Label);
        var fangjianhao = this.node.getChildByName("fangjianhao").getComponent(cc.Label);
        var wanjia = this.node.getChildByName("wanjia").getComponent(cc.Label);
        var fenshu = this.node.getChildByName("fenshu").getComponent(cc.Label);
        var jieguo = this.node.getChildByName("jieguo").getComponent(cc.Label);

        var kPlayTime = TotalRecord.kPlayTime;
        shijian.string = kPlayTime.wMonth + "月" + kPlayTime.wDay + "号 " + kPlayTime.wHour + ":" + kPlayTime.wMinute;
        
        fangjianhao.string = TotalRecord.iRoomNum;

        wanjia.string = "";
        for (var i = 0; i < TotalRecord.kNickNameSize; ++i) {
            if (TotalRecord.kNickName[i].length > 0)
                wanjia.string += TotalRecord.kNickName[i] + "\n";
        }

        var id = 0;
        var localPlayerId = cc.PlayerMgr.getLocalPlayerId();
        for (var i = 0; i < TotalRecord.kUserIDSize; ++i) {
            if (TotalRecord.kUserID[i] == localPlayerId) {
                id = i;
                break;
            }
        }

        var kScore = TotalRecord.kScore[id];
        fenshu.string = kScore + "";

        if (kScore > 0)
            jieguo.string = "赢";
        else if (kScore < 0)
            jieguo.string = "输";
        else
            jieguo.string = "平";
    },

    // 战绩
    onBtnPlaybackClicked: function() {
        cc.UserServiceMsg.sendQueryGameRecordTotal(cc.PlayerMgr.getLocalPlayerId(), this.TotalRecord.iRecordID);
    },

    onQueryGameRecordTotalResult: function(TotalRecord) {
        if (!cc.Room || !cc.Room.node || !cc.Room.node.active) {
            cc.director.loadScene('Room',
            function onRoomLaunched(arg0, scene) {
                // 禁用房间游戏脚本, 只使用回放
                if (scene) {
                    var root = scene.getChildren()[0];

                    root.removeComponent("Room");
                    root.removeComponent("RoomChat");
                    root.removeComponent("RoomChat");
                    
                    var RoomPlaybackJS = root.getComponent("RoomPlayback");
                    if (RoomPlaybackJS)
                        RoomPlaybackJS.TotalRecord = TotalRecord;
                }
            });
        }
    },
});
