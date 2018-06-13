
cc.Class({
    extends: cc.Component,

    properties: {
        //-------牛牛------------------
        jushu1:cc.Toggle,//10 局
        jushu2:cc.Toggle,//20局
        NNgamenum4:cc.Toggle,//牛牛游戏人数4
        NNgamenum6:cc.Toggle,//牛牛游戏人数6
        NNfangfei3:cc.Toggle,//房费3张
        NNfangfeiaa:cc.Toggle,//房费一张AA
        NNdifen2:cc.Toggle,//底分1-2
        NNdifen4:cc.Toggle,//底分2-4
        NNdifen6:cc.Toggle,//底分4-6
        NNfanbei1:cc.Toggle,//牛七 –牛八   2倍   牛九  3倍   牛牛 4倍
        NNfanbei2:cc.Toggle,//牛一-牛三 1倍 牛四-牛六 2倍 七牛-牛九 3倍 牛年4倍
        NNdongtaijoin:cc.Toggle,//动态加入
        NNNotdongtaijoin:cc.Toggle,//禁止动态加入

        //--------通比牛牛-----------------
        TBNNfangfei4:cc.Toggle,//房费4张 房主付
        TBNNfangfeiaa:cc.Toggle,//AA 每人一张
        TBNNdifen20:cc.Toggle,//底分20分
        TBNNdifen40:cc.Toggle,//底分40分
        TBNNdifen60:cc.Toggle,//底分60分
        TBNNdongtaijoin:cc.Toggle,//动态加入
        TBNNNotdongtaijoin:cc.Toggle,//禁止动态加入

        //--------转转牛牛-----------------
        ZZNNfangfei4:cc.Toggle,//房费4张 房主付
        ZZNNfangfeiaa:cc.Toggle,//AA 每人一张
        ZZNNdifen20:cc.Toggle,//底分20分
        ZZNNdifen40:cc.Toggle,//底分40分
        ZZNNdifen60:cc.Toggle,//底分60分
        ZZNNdongtaijoin:cc.Toggle,//动态加入
        ZZNNNotdongtaijoin:cc.Toggle,//禁止动态加入
    },

    // use this for initialization
    onLoad: function () {
        cc.Home = this;

        // 查询公告
        cc.UserServiceMsg.sendQueryPublicNotice("NC_NOTICE");
        cc.UserServiceMsg.sendQueryPublicNotice("NC_SHOP_TXT");

        // 查询房间列表
        cc.GamePrivateMsg.sendQueryRoomListPrivate();

        // 设置头像信息
        var player = cc.PlayerMgr.getPlayer(0);
        if (player) {
            var touxiang = cc.find("title/touxiang", this.node);
            var icon = cc.find("txProfile", touxiang).getComponent(cc.Sprite);
            var name = cc.find("txName", touxiang).getComponent(cc.Label);
            var id = cc.find("txId", touxiang).getComponent(cc.Label);
            var fkNum = cc.find("fkNum", touxiang).getComponent(cc.Label);

            this.onUpdatePlayerInfo(player);

            name.string = player.accountInfo.szNickName;
            id.string = "ID:" + player.accountInfo.dwUserID;
            fkNum.string = player.accountInfo.lInsure;
        }

        // 设置音乐
        var sfx = cc.find("settingsFrame/yinxiaoBar", this.node).getComponent(cc.Slider);
        sfx.progress = cc.AudioMgr.getSFXVolume();
        this.onSliderSettings(sfx, "sfx");

        var bgm = cc.find("settingsFrame/yinyueBar", this.node).getComponent(cc.Slider);
        bgm.progress = cc.AudioMgr.getBGMVolume();
        this.onSliderSettings(bgm, "bgm");

        cc.AudioMgr.playBGM("homeBgm.mp3");
    },

    // called every frame 
    update: function (dt) {
        cc.NetMgr.update(dt);
    },

    onUpdatePlayerInfo: function(player) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer && player) {
            var localAccountInfo = localPlayer.accountInfo;
            var accountInfo = player.accountInfo;
            if (localAccountInfo && accountInfo && localAccountInfo.dwUserID == accountInfo.dwUserID) {
                var individualInfo = localPlayer.individualInfo;
                if (individualInfo && individualInfo.szHeadHttp && individualInfo.szHeadHttp.length > 0) {
                    var touxiang = cc.find("title/touxiang", this.node);
                    var icon = cc.find("txProfile", touxiang).getComponent(cc.Sprite);
                    if (cc.ResourceMgr.icons[individualInfo.szHeadHttp])
                        icon.spriteFrame = cc.ResourceMgr.icons[individualInfo.szHeadHttp];
                    else {
                        cc.loader.load(individualInfo.szHeadHttp, function (err, tex) {
                            if (tex) {
                                var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
                                icon.spriteFrame = spriteFrame;
                                cc.ResourceMgr.icons[individualInfo.szHeadHttp] = spriteFrame;
                            }
                        });
                    }
                }
            }
        }
    },

    onUpdatePlayerProfile: function(player) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer && player) {
            var localAccountInfo = localPlayer.accountInfo;
            var accountInfo = player.accountInfo;
            if (localAccountInfo && accountInfo && localAccountInfo.dwUserID == accountInfo.dwUserID) {
                var individualInfo = localPlayer.individualInfo;
                if (individualInfo && individualInfo.szHeadHttp && individualInfo.szHeadHttp.length > 0) {
                    var frame = this.node.getChildByName("profileSimpleFrame");
                    var icon = cc.find("icon", frame).getComponent(cc.Sprite);
                    if (cc.ResourceMgr.icons[individualInfo.szHeadHttp])
                        icon.spriteFrame = cc.ResourceMgr.icons[individualInfo.szHeadHttp];
                    else {
                        cc.loader.load(individualInfo.szHeadHttp, function (err, tex) {
                            if (tex) {
                                var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
                                icon.spriteFrame = spriteFrame;
                                cc.ResourceMgr.icons[individualInfo.szHeadHttp] = spriteFrame;
                            }
                        });
                    }
                }
            }
        }
    },

    onBtnProfileClicked: function() {
        var player = cc.PlayerMgr.getPlayer(0);
        if (player) {
            var frame = this.node.getChildByName("profileSimpleFrame");

            var icon = cc.find("icon", frame).getComponent(cc.Sprite);
            var xingbieIcon = cc.find("xingbieIcon", frame).getComponent(cc.Sprite);
            var name = cc.find("xingbieIcon/name", frame).getComponent(cc.Label);
            var dingwei = cc.find("dingweiIcon/dingwei", frame).getComponent(cc.Label);
            var ju = cc.find("juIcon/ju", frame).getComponent(cc.Label);
            var id = cc.find("idIcon/id", frame).getComponent(cc.Label);
            var ip = cc.find("ipIcon/ip", frame).getComponent(cc.Label);
            var haoyou = cc.find("haoyouIcon/haoyou", frame).getComponent(cc.Label);

            this.onUpdatePlayerProfile(player);
            if (player.accountInfo.cbGender == 1)
                xingbieIcon.spriteFrame = cc.ResourceMgr.icons["nan"];
            else
                xingbieIcon.spriteFrame = cc.ResourceMgr.icons["nv"];
            
            name.string = player.accountInfo.szNickName ? player.accountInfo.szNickName : "未知";
            dingwei.string = player.individualInfo.szUserGps ? player.individualInfo.szUserGps : "未知";
            ju.string = player.accountInfo.dwExperience ? player.accountInfo.dwExperience : "0";
            id.string = player.accountInfo.dwUserID;
            ip.string = player.individualInfo.szLogonIP ? player.individualInfo.szLogonIP : "127.0.0.1";
            haoyou.string = (player.accountInfo.MemberOverDate && player.accountInfo.MemberOverDate.wYear) ? (player.accountInfo.MemberOverDate.wYear+"/"+player.accountInfo.MemberOverDate.wMonth+"/"+player.accountInfo.MemberOverDate.wDay) : "2017/01/01";

            frame.active = true;
        }
    },

    onBtnProfileAnyWhereClicked: function() {
        var frame = this.node.getChildByName("profileSimpleFrame");
        frame.active = false;
    },

    onBtnMsgClicked: function() {
        var frame = this.node.getChildByName("msgFrame");
        frame.active = true;
    },

    onBtnSettingClicked: function() {
        var frame = this.node.getChildByName("settingsFrame");
        frame.active = true;
    },

    onBtnGuizeClicked: function() {
        var frame = this.node.getChildByName("guizeFrame");
        frame.active = true;
    },

    onBtnFankuiClicked: function() {
        var frame = this.node.getChildByName("fankuiFrame");
        frame.active = true;
    },

    onBtnFenxiangClicked: function() {
        var frame = this.node.getChildByName("fenxiangFrame");
        frame.active = true;
    },

    onBtnFangKaJiaClicked: function() {
        var frame = this.node.getChildByName("fangkaFrame");
        frame.active = true;
    },

    onBtnFangKaJiaCloseClicked: function() {
        var frame = this.node.getChildByName("fangkaFrame");
        frame.active = false;
    },

    //---------------------------------------------------------------------------------
    // 公告
    onQueryPublicNoticeResult: function(content) {
        if (content.search('房卡') >= 0) {
            var text = cc.find("fangkaFrame/content", this.node).getComponent(cc.Label);
            text.string = content;
        }
        else if (content.search('欢') >= 0) {
            var text = cc.find("center/paomadeng/mask/text", this.node).getComponent(cc.Label);
            text.string = content;
        }
    },

    // 房间列表
    onRoomList: function(data) {
        var content = cc.find("center/roomList/bg/scrollview/view/content", this.node);
        var prefabRoomItem = cc.ResourceMgr.prefab["PrefabRoomItem"];
        var x = 0;
        var y = -25;
        var h = 40;
        var datalist = {};
        for (var i = 0; i < data.dwRoomNum.length; ++i) {
            var roomNum = data.dwRoomNum[i];
            datalist.roomNum = data.dwRoomNum[i];
            datalist.roomType = data.roomType[i];
            datalist.difen = data.difen[i];
            datalist.jushu = data.jushu[i];
            datalist.playerMax = data.playerMax[i];
            datalist.playerJoinNum = data.playerJoinNum[i];
            if (roomNum >= 100000) {
                content.height += h;
                var instance = cc.instantiate(prefabRoomItem);
                var script = instance.getComponent("RoomItem");
                script.set(datalist);
                instance.x = x;
                instance.y = y;
                y -= h;
                instance.parent = content;
            }
        }
    },

    // 战绩
    onBtnZhanjiClicked: function() {
        cc.UserServiceMsg.sendQueryGameRecordList(cc.PlayerMgr.getLocalPlayerId());

        var frame = this.node.getChildByName("zhanjiFrame");
        frame.active = true;
    },

    onQueryGameRecordListResult: function(TotalRecordList) {
        var frame = this.node.getChildByName("zhanjiFrame");
        var content = cc.find("bg/scrollview/view/content", frame);
        var prefabZhanJiItem = cc.ResourceMgr.prefab["PrefabZhanJiItem"];
        var x = 0;
        var y = -85;
        var h = 175;
        for (var i = 0; i < TotalRecordList.kListSize; ++i) {
            var kList = TotalRecordList.kList[i];

            content.height += h;

            var instance = cc.instantiate(prefabZhanJiItem);
            var script = instance.getComponent("ZhanJiItem");
            script.set(kList);
            
            instance.x = x;
            instance.y = y;
            y -= h;
            instance.parent = content;
        }

        if (TotalRecordList.kListSize <= 0)
            cc.find("bg/wuzhanji", frame).active = true;
        else
            cc.find("bg/wuzhanji", frame).active = false;
    },

    onBtnQuitClicked: function() {
        var frame = this.node.getChildByName("quitFrame");
        frame.active = true;
    },

    onBtnCreateRoomClicked: function() {
        var frame = this.node.getChildByName("createRoomFrame");
        frame.active = true;
    },

    onBtnCreateRoomCreateClicked: function(event, customEventData) {
        var playCount = 0;
        var gameRule = 0;
        gameRule = cc.FvMask.add(gameRule, GAME_RULE_WIN_ZHUANG);
        gameRule = cc.FvMask.add(gameRule, GAME_RULE_SUIJIZHUANG);

        // 牛牛
        if (customEventData == 1) { 
            gameRule = cc.FvMask.add(gameRule, GAME_RULE_TYPE_NIUNIU);
            
            // 人数
          //  if (this.NNgamenum4.isChecked)
              //  gameRule = cc.FvMask.add(gameRule, GAME_RULE_GAMEPLAER_4);
          //  else
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_GAMEPLAER_6);

            // 局数
            if (this.jushu1.isChecked)
                playCount = 10;
            else
                playCount = 20;

            // 房费
            if (this.NNfangfeiaa.isChecked) // AA 制就添加这个状态，否则默认由房主付钱
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_ROOM_COST_TYPE);

            // 底分
            if (this.NNdifen2.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_1);
            if (this.NNdifen4.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_2);
            if (this.NNdifen6.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_3);

            // 翻倍
            if (this.NNfanbei1.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_PLAYSCORE_TIEMS_1);
            if (this.NNfanbei2.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_PLAYSCORE_TIEMS_2);

            // 动态加入，默认禁止
            if (this.NNdongtaijoin.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_DYNAMIC_JOIN);
        }

        // 通比牛牛
        if (customEventData == 2) {
            gameRule = cc.FvMask.add(gameRule, GAME_RULE_TYPE_TONGBINIUNIU);

            // 局数
            playCount = 4;

            // 房费
            if (this.TBNNfangfeiaa.isChecked) // AA 制就添加这个状态，否则默认由房主付钱
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_ROOM_COST_TYPE);

            // 底分
            if (this.TBNNdifen20.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_1);
            if (this.TBNNdifen40.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_2);
            if (this.TBNNdifen60.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_3);

            // 动态加入，默认禁止
            if (this.TBNNdongtaijoin.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_DYNAMIC_JOIN);
        }

        // 转转牛牛
        if (customEventData == 3) {
            gameRule = cc.FvMask.add(gameRule, GAME_RULE_TYPE_ZHUANZHUANNIUNIU);
            gameRule = cc.FvMask.add(gameRule, GAME_RULE_GAMEPLAER_4);

            // 局数
            playCount = 16;

            // 房费
            if (this.ZZNNfangfeiaa.isChecked) // AA 制就添加这个状态，否则默认由房主付钱
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_ROOM_COST_TYPE);

            // 底分
            if (this.ZZNNdifen20.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_1);
            if (this.ZZNNdifen40.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_2);
            if (this.ZZNNdifen60.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_BASESCORE_3);

            // 动态加入，默认禁止
            if (this.ZZNNdongtaijoin.isChecked)
                gameRule = cc.FvMask.add(gameRule, GAME_RULE_DYNAMIC_JOIN);
        }
        
        cc.GamePrivateMsg.sendCreatePrivate(GAME_TYPE_PRIVATE, playCount, gameRule);
    },
    
    onBtnCreateRoomCloseClicked: function() {
        var frame = this.node.getChildByName("createRoomFrame");
        frame.active = false;
    },

    onBtnJoinRoomClicked: function() {
        var frame = this.node.getChildByName("joinRoomFrame");
        frame.active = true;
    },

    onBtnJoinRoomJoinClicked: function() {
        var numPad = cc.find("joinRoomFrame/PrefabNumPad", this.node).getComponent("NumPad");
        var num = numPad.getNumber();
        if (num && num >= 100000) {
            cc.GamePrivateMsg.sendJoinPrivate(num);
            cc.GamePrivateMsg.sendSitDownPrivate(num);
        }
    },

    onBtnJoinRoomCloseClicked: function() {
        var frame = this.node.getChildByName("joinRoomFrame");
        frame.active = false;
    },

    onToggleTabClicked: function(toggle, customEventData) {
        cc.find("nnsz/frame", toggle.node.parent).active = false;
        cc.find("tbnn/frame", toggle.node.parent).active = false;
        cc.find("llzz/frame", toggle.node.parent).active = false;
        toggle.node.getChildByName("frame").active = true;
    },

    onSliderSettings: function(slider, customEventData) {
        var fg = slider.node.getChildByName("Foreground");
        var sprite = fg.getComponent(cc.Sprite);
        sprite.fillRange = slider.progress;
        
        if (customEventData == "sfx") {
            cc.AudioMgr.setSFXVolume(slider.progress);
        }
        else {
            cc.AudioMgr.setBGMVolume(slider.progress);
        }
    },

    onBtnSettingsChangeAccountClicked: function() {
        
    },

    onBtnSettingsOkClicked: function() {
        var frame = this.node.getChildByName("settingsFrame");
        frame.active = false;
    },

    onBtnSettingsCloseClicked: function() {
        var frame = this.node.getChildByName("settingsFrame");
        frame.active = false;
    },

    onBtnQuitCloseClicked: function() {
        var frame = this.node.getChildByName("quitFrame");
        frame.active = false;
    },

    onBtnQuitQuitClicked: function() {
        var frame = this.node.getChildByName("quitFrame");
        frame.active = false;
        cc.director.loadScene("Login");
    },

    onBtnMsgCloseClicked: function() {
        var frame = this.node.getChildByName("msgFrame");
        frame.active = false;
    },

    onBtnGuizeCloseClicked: function() {
        var frame = this.node.getChildByName("guizeFrame");
        frame.active = false;
    },

    onBtnFankuiCloseClicked: function() {
        var frame = this.node.getChildByName("fankuiFrame");
        frame.active = false;
    },

    onBtnFenxiangCloseClicked: function() {
        var frame = this.node.getChildByName("fenxiangFrame");
        frame.active = false;
    },
    
    onBtnZhanjiPrevClicked: function() {
        var frame = this.node.getChildByName("zhanjiFrame");
        frame.active = false;
    },
});
