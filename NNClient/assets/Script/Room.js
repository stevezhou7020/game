
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // 初始化
    onLoad: function () {
        cc.Room = this;

        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            var agent = anysdk.agentManager;
            this.share_plugin = agent.getSharePlugin();
            this.share_plugin.setListener(this.onShareResult, this);
        }
    },

    // 启用
    start: function() {
        // 房间场景启用时先初始化一次玩家信息, 以免遗漏
        for (var key in cc.PlayerMgr.players) {
			if (key) {
				var player = cc.PlayerMgr.players[key];
				if (player.userInfo)
					this.onUpdatePlayerEnter(player);
			}
		}

        // 房间场景启用时先初始化一次房间信息
        this.onUpdateRoom();

        cc.AudioMgr.playBGM("roomBgm.mp3");
    },

    // 退出
    onDisable: function() {
        // 退出游戏房间后, 需要清理掉房间内玩家信息
        for (var key in cc.PlayerMgr.players) {
			if (key) {
				var player = cc.PlayerMgr.players[key];
				if (!player.userInfo || player.userInfo.dwUserID != cc.PlayerMgr.localPlayerId)
					player.userInfo = null;
			}
		}

        // 需要重置游戏房间内相关全局变量
        cc.ZhuangJia = -1;
        cc.TuiZhuMax = 2;
        cc.CardAll = [];
        cc.OxAll = [];

        // 关闭各UI到相应初始状态
        cc.RoomView.disableAll();
    },

    // called every frame
    update: function (dt) {
        cc.NetMgr.update(dt);
    },

    //-------------------------------------------------------------------------
    // 场景消息(掉线重连逻辑)
    // 空闲状态
    onSceneMsgFree:function(data) {
		var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        localUserInfo.cbUserStatus = US_SIT;
        this.onUpdateRoom();
    },

    // 下注状态
    onSceneMsgScore:function(data) {
        // 直接自动加注
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_ZHUANZHUANNIUNIU)){

        }
        if(data.bZaNiaoUser){ //扎鸟用户处理方式
            this.onClickCloseZhuaNiao();
            cc.GameMgr.sendZaniaoScore(data.wToChairID, data.LAddScoreZN, 3);
        }else{
            cc.GameMgr.sendAddScore(data.lTableScore[localUserInfo.wChairID]);
        }
	},

	// 游戏中状态
	onSceneMsgPlaying:function(data) {
		var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 显示与填充UI上的牌
        cc.CardAll = data.cbHandCardData;
        //如果不是扎鸟用户
        if(!data.bZaNiaoUser){
            for (var i = 0; i < cc.CardAll.length; ++i) {
                var cards = cc.CardAll[i];
                if (cards[0]) {
                    // 设置一个位置的牌, 其中只有本地玩家的牌面可见
                    cc.RoomView.setCardsVis(localUserInfo.wChairID, i, i == localUserInfo.wChairID);
                    cc.RoomView.setCards(localUserInfo.wChairID, i, cards);

                    // 如果是自己的位置
                    if (localUserInfo.wChairID == i) {
                        // 恢复牌可点选且选择状态为未选择
                        cc.RoomView.setCardsSelectable(localUserInfo.wChairID, i, true);
                        cc.RoomView.setCardsSelect(localUserInfo.wChairID, i, false);

                        // 显示提示与摊牌按钮
                        cc.RoomView.enableHelpBtn();
                        cc.RoomView.enableOpenBtn();
                    }

                    // 显示该位置的牌
                    cc.RoomView.enableCards(localUserInfo.wChairID, i);
                }
            }
        }
        else{//下面是扎鸟用户的处理方式
            for (var i = 0; i < cc.CardAll.length; ++i) {
                var cards = cc.CardAll[i];
                if (cards[0]) {
                    // 设置一个位置的牌, 其中只有本地玩家的牌面可见
                    cc.RoomView.setCardsVis(localUserInfo.wChairID, i, i == localUserInfo.wChairID);
                    cc.RoomView.setCards(localUserInfo.wChairID, i, cards);
                    // 显示该位置的牌
                    cc.RoomView.enableCards(localUserInfo.wChairID, i);
                }
            }

        }
        // 显示庄家图标
        cc.ZhuangJia = data.wBankerUser;
        cc.RoomView.setBanker(localUserInfo.wChairID, data.wBankerUser);
        // 显示加注金币图片
        for (var i = 0; i < PLAYER_COUNT; ++i) {
            if (i != data.wBankerUser && data.lTableScore[i])
                cc.RoomView.enableAddScoreGold(localUserInfo.wChairID, i, data.lTableScore[i]/* * cc.DiFen*/);
            else
                cc.RoomView.disableAddScoreGold(localUserInfo.wChairID, i);
        }
	},

    //-------------------------------------------------------------------------
    // 网络层更新房间
    onUpdateRoom: function () {
        // 显示房间信息
        if (cc.RoomInfo && cc.RoomInfo.dwRoomNum) {
            var roomInfo = {};
            roomInfo.roomNum = "房号：" + cc.RoomInfo.dwRoomNum;

            // 通比牛牛
            if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_TONGBINIUNIU)) {
                roomInfo.zhuangwei = "庄位：通比牛牛";
                roomInfo.jushu = "局数：" + cc.RoomInfo.dwPlayCout + "/" + cc.RoomInfo.dwPlayTotal;

                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                    cc.DiFen = 20;
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                    cc.DiFen = 40;
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                    cc.DiFen = 60;
            }
            // 牛牛
            else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_NIUNIU)) {
                roomInfo.zhuangwei = "庄位：牛牛";
                roomInfo.jushu = "局数：" + cc.RoomInfo.dwPlayCout + "/" + cc.RoomInfo.dwPlayTotal;

                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                    cc.DiFen = 2;
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                    cc.DiFen = 4;
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                    cc.DiFen = 6;
            }
            // 转转牛牛
            else {
                roomInfo.zhuangwei = "庄位：转转牛牛";
                roomInfo.jushu = "局数：直至轮庄结束";

                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                    cc.DiFen = 20;
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                    cc.DiFen = 40;
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                    cc.DiFen = 60;
            }

            roomInfo.difen = "底分：" + cc.DiFen;

            cc.RoomView.setRoomInfo(roomInfo);
            cc.RoomView.enableRoomInfo();
        }

        // 如果本地玩家已经坐下, 则恢复各UI到相应初始状态
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer) {
            var localUserInfo = localPlayer.userInfo;
            if (localUserInfo && localUserInfo.cbUserStatus == US_SIT) {
                // 关闭、隐藏闹钟
                cc.RoomView.closeClock();

                // 隐藏提示和比牌按钮
                cc.RoomView.disableHelpBtn();
                cc.RoomView.disableOpenBtn();

                // 显示准备按钮
                cc.RoomView.enableReadyBtn();
            }
        }
    },

    // 网络层玩家进入
    onUpdatePlayerEnter: function(player) {
        var userInfo = player.userInfo;

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 如果尚未设置则初始设置玩家信息并显示
        if (cc.RoomView.isPlayerInfoEnabled(localUserInfo.wChairID, userInfo.wChairID) != true) {
            cc.RoomView.setPlayerInfo(localUserInfo.wChairID, userInfo.wChairID, userInfo, player);
            cc.RoomView.enablePlayerInfo(localUserInfo.wChairID, userInfo.wChairID);
        }
        
        var individualInfo = player.individualInfo;
        if (localUserInfo && userInfo && individualInfo)
            cc.RoomView.setPlayerIndividual(localUserInfo.wChairID, userInfo.wChairID, individualInfo);
    },

    // 网络层玩家离开
    onUpdatePlayerLeave: function(player, prevChairID) {
        var userInfo = player.userInfo;

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        var isLocalPlayer = localUserInfo.dwUserID == userInfo.dwUserID;

        // 本地玩家离开则退到主界面
		if (isLocalPlayer) {
            if (!cc.RoomView.isFinalInfoEnabled())
                cc.director.loadScene("Home");
			return;
		}
        // 本桌其他玩家离开则关闭桌面上对应头像
        else {
			cc.RoomView.disablePlayerInfo(localUserInfo.wChairID, prevChairID);
			return;
		}
    },

    // 网络层更新玩家用户信息、个人资料
    onUpdatePlayerInfo: function(player) {
        var userInfo = player.userInfo;
        var individualInfo = player.individualInfo;

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        if (localUserInfo && userInfo && individualInfo)
            cc.RoomView.setPlayerIndividual(localUserInfo.wChairID, userInfo.wChairID, individualInfo);
    },

    // 网络层更新玩家分数
    onUpdatePlayerScore: function(player) {
    },

    // 网络层更新玩家状态 
    onUpdatePlayerStatus: function(player, prevStatus) {
    },

    // 网络层发牌
    onSendAllCard: function(data) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 恢复各UI到相应初始状态
        for (var i = 0; i < PLAYER_COUNT; ++i) {
            // 隐藏加注金币图片
            cc.RoomView.disableAddScoreGold(0, i);
            
            // 隐藏牌上完成、牛牛结果、得分图片
            cc.RoomView.disableCardFinish(0, i);
            cc.RoomView.disableCardOx(0, i);
            cc.RoomView.disableCardScore(0, i);
        }

        // 显示与填充UI上的牌
        cc.CardAll = data.cbCardData;
        for (var i = 0; i < cc.CardAll.length; ++i) {
            var cards = cc.CardAll[i];
            if (cards[0]) {
                // 设置一个位置的牌且牌面不可见
                cc.RoomView.setCardsVis(localUserInfo.wChairID, i, false);
                cc.RoomView.setCards(localUserInfo.wChairID, i, cards);

                // 如果是自己的位置
                if (localUserInfo.wChairID == i) {
                    // 如果是牛牛游戏
                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_NIUNIU)) {
                        // 设置第0到第3张牌为牌面可见
                        for (var j = 0; j <= 3; ++j)
                            cc.RoomView.setCardVis(localUserInfo.wChairID, i, j, true);
                    }
                }

                // 显示该位置的牌
                cc.RoomView.enableCards(localUserInfo.wChairID, i);
            }
        }

        cc.AudioMgr.playSFX("fapai.mp3");
    },

    // 网络层比赛开始
    onGameStart: function(data) {
        cc.RoomView.disableReadyBtn();
        cc.RoomView.disableWXInviteBtn();
        
        // 初始化牛标识数组
        for (var i = 0; i < PLAYER_COUNT; ++i)
            cc.OxAll[i] = 0;
        
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 显示庄家图标
        cc.RoomView.setBanker(localUserInfo.wChairID, data.wBankerUser);
        
        // 第一个庄家不能显示加注, 第二个要用推注规则
        // 如果连续赢就推注加倍, 最高不超过 48
        var baseTimesScore = 0;
        if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1)) baseTimesScore = 2;
        if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2)) baseTimesScore = 4;
        if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3)) baseTimesScore = 6;

        if (cc.ZhuangJia == data.wBankerUser) {
            if (cc.TuiZhuMax * 2 <= 48)
                cc.TuiZhuMax = cc.TuiZhuMax * 2;
            else if(cc.TuiZhuMax <= 48 && cc.TuiZhuMax * 2 > 48)
                cc.TuiZhuMax = 48;
            else
                cc.TuiZhuMax = baseTimesScore;
        }
        else {
            // 转转牛牛, 庄家金币堆动画
            if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_ZHUANZHUANNIUNIU)) {
                if (cc.ZhuangJia >= 0)
                    cc.RoomView.spawnGoldsStackPayback(localUserInfo.wChairID, cc.ZhuangJia);
                cc.RoomView.clearGoldsStack();
                cc.RoomView.spawnGoldsStackAnimBetChairID(localUserInfo.wChairID, data.wBankerUser, cc.DiFen);
            }

            cc.ZhuangJia = data.wBankerUser;
            cc.TuiZhuMax = baseTimesScore;
        }
	
        // 通比牛牛不需要手动加注, 向服务器加注默认 1 倍
        if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_TONGBINIUNIU)){
            var addScore =0;
           if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, (GAME_RULE_BASESCORE_1))) {
                addScore =20;
            }
            else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, (GAME_RULE_BASESCORE_2))) {
                addScore = 40;
            }
            else
            {
                addScore = 60;
            }
            cc.GameMgr.sendAddScore(addScore);
        }
        else {
            // 庄家不能加倍, 如果本地玩家是庄家则隐藏下注按钮
            if (localUserInfo.wChairID == data.wBankerUser)
                cc.RoomView.disableAddScoreBtn();
            else {
                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_GAMEPLAER_6) || localUserInfo.wChairID <= 3) {
                    // 设置与显示加注按钮
                    if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_ZHUANZHUANNIUNIU)){
                       if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1)) {
                           cc.RoomView.setAddScoreBtn(5,10);
                       }
                        if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2)) {
                            cc.RoomView.setAddScoreBtn(10,20);
                        }
                        if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3)) {
                            cc.RoomView.setAddScoreBtn(20,30);
                        }
                    }else{
                        cc.RoomView.setAddScoreBtn(cc.TuiZhuMax / 2, cc.TuiZhuMax);
                    }
                    cc.RoomView.enableAddScoreBtn();
                }
                else {
                    this.openZhaNiaoUI();
                }
            
                // 开始加注倒计时闹钟
                cc.RoomView.startClock(18);
            }
        }
    },

    // 网络层加注
    onAddScore: function(data) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 显示加注金币图片
        if (cc.ZhuangJia != data.wAddScoreUser)
            cc.RoomView.enableAddScoreGold(localUserInfo.wChairID, data.wAddScoreUser, data.lAddScoreCount/* * cc.DiFen*/)

        // 不是自己则重新开始加注倒计时闹钟
        if (localUserInfo.wChairID != data.wAddScoreUser)
            cc.RoomView.restartClock();
        // 关闭、隐藏加注倒计时闹钟
        else
            cc.RoomView.closeClock();

        // 转转牛牛, 闲家金币堆动画
        /*if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_ZHUANZHUANNIUNIU))
            cc.RoomView.spawnGoldsStackAnimBetChairID(localUserInfo.wChairID, data.wAddScoreUser, data.lAddScoreCount);*/
    },

    // 网络层发牌
    onSendCard: function(data) {
        // 关闭、隐藏加注倒计时闹钟
        cc.RoomView.closeClock();
        cc.RoomView.disableAddScoreBtn();

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 显示与填充UI上的牌
        cc.CardAll = data.cbCardData;
        for (var i = 0; i < cc.CardAll.length; ++i) {
            var cards = cc.CardAll[i];
            if (cards[0]) {
                // 设置一个位置的牌, 其中只有本地玩家的牌面可见
                cc.RoomView.setCardsVis(localUserInfo.wChairID, i, i == localUserInfo.wChairID);
                cc.RoomView.setCards(localUserInfo.wChairID, i, cards);

                // 如果是自己的位置, 开始比牌倒计时闹钟、显示提示与摊牌按钮
                if (localUserInfo.wChairID == i) {
                    cc.RoomView.startClock(17);

                    // 恢复牌可点选且选择状态为未选择
                    cc.RoomView.setCardsSelectable(localUserInfo.wChairID, i, true);
                    cc.RoomView.setCardsSelect(localUserInfo.wChairID, i, false);
                    
                    // 显示提示与摊牌按钮
                    cc.RoomView.enableHelpBtn();
                    cc.RoomView.enableOpenBtn();
                }

                // 显示该位置的牌
                cc.RoomView.enableCards(localUserInfo.wChairID, i);
            }
        }

        cc.AudioMgr.playSFX("fapai.mp3");
    },

    // 网络层摊牌
    onOpenCard: function(data) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 记录该用户牛表示
        cc.OxAll[data.wPlayerID] = data.bOpen;

        // 恢复牌选择状态为不可点选
        cc.RoomView.setCardsSelectable(localUserInfo.wChairID, data.wPlayerID, false);
        
        // 显示本桌其他玩家完成图片
        if (localUserInfo.wChairID != data.wPlayerID) {
            cc.RoomView.enableCardFinish(localUserInfo.wChairID, data.wPlayerID);
            
            // 不是自己则重新开始比牌倒计时闹钟
            cc.RoomView.restartClock();
        }
        // 关闭、隐藏比牌倒计时闹钟
        else {
            cc.RoomView.closeClock();
        }
    },

    // 网络层这一局比赛结束
    onGameEnd: function(data) {
        // 关闭、隐藏比牌倒计时闹钟
        cc.RoomView.closeClock();

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        for (var i = 0; i < PLAYER_COUNT; ++i) {
            // 恢复牌不可点选且选择状态为未选择
            cc.RoomView.setCardsSelectable(localUserInfo.wChairID, i, false);
            cc.RoomView.setCardsSelect(localUserInfo.wChairID, i, false, true);

            // 设置所有用户的牌牌面可见
            cc.RoomView.setCardsVis(localUserInfo.wChairID, i, true);

            // 隐藏玩家完成图片
            cc.RoomView.disableCardFinish(localUserInfo.wChairID, i);
        }

        // 显示所有用户牛情况
        for (var i = 0; i < cc.CardAll.length; ++i) {
            var cards = cc.CardAll[i];
            if (cards[0]) {
                // 如果用户自己标识为没牛, 那么就没牛
                var ox = cc.OxAll[i] > 0 ? cc.OxGameLogic.GetCardType(cards, CARD_COUNT)[0] : OX_VALUE0;
                cc.RoomView.setCardOx(localUserInfo.wChairID, i, ox);
                cc.RoomView.enableCardOx(localUserInfo.wChairID, i);

                // 只播放本地玩家的牛语音
                if (localUserInfo.wChairID == i) {
                    var prefix = "manbull";
                    if (localUserInfo.cbGender != 1) prefix = "womanbull";
                    cc.AudioMgr.playSFX(prefix + ox + ".mp3");
                }
            }
        }
        
        // 显示所有用户分数变化
        for (var i = 0; i < data.lGameScore.length; ++i) {
            var score = data.lGameScore[i];
            if (score != 0) {
                cc.RoomView.setCardScore(localUserInfo.wChairID, i, score);
                cc.RoomView.enableCardScore(localUserInfo.wChairID, i);

                // 转转牛牛, 闲家金币堆动画
                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_ZHUANZHUANNIUNIU)) {
                    if (cc.ZhuangJia >= 0 && i != cc.ZhuangJia) {
                        //if (i < 4)
                            cc.RoomView.spawnGoldsStackAnimConcludeChairID(localUserInfo.wChairID, i, score);
                        //else
                        //    cc.RoomView.spawnGoldsAnimChairID(localUserInfo.wChairID, cc.ZhuangJia, i, score);
                    }
                }
                // 金币动画
                else if (cc.ZhuangJia >= 0 && i != cc.ZhuangJia)
                    cc.RoomView.spawnGoldsAnimChairID(localUserInfo.wChairID, cc.ZhuangJia, i, score);
            }
        }
    },

    // 网络层结算房间
    onEndRoom: function(data) {
        var self = this;
        setTimeout(function() {
            cc.RoomView.clearGoldsStack();

            // 设置并显示结算界面
            var jiesan = cc.find("jiesanstatus", self.node);
            jiesan.getChildByName("shenqingfail").active = false;
            jiesan.active = false;
            cc.RoomView.setFinalInfo(data);
            cc.RoomView.enableFinalInfo();
        }, 2000);
    },

    // 结算返回按钮点击
    onJieSuanPrev: function() {
        // 关闭结算界面
        cc.RoomView.disableFinalInfo();

        // 起立离开
        var player = cc.PlayerMgr.getPlayer(0);
        if (player && player.userInfo)
            cc.GameUserMsg.sendStandUp(player.userInfo.wTableID, player.userInfo.wChairID, 0);

        // 打开主界面
        cc.director.loadScene("Home");
    },

    // 后退按钮点击
    onBtnPrevClicked: function() {
        // 请求解散房间并起立
        var player = cc.PlayerMgr.getPlayer(0);
	
        if (cc.ZhuangJia!=-1){//说明总执行了一次
            //如果游戏已经开始发牌，退出房间需要就意味着申请解散房间
            var jiesuanshenqing = cc.find("JiesanShenqing",this.node);
            if(jiesuanshenqing.active == true){
                //如何自己或别人点了
                return ;
            }
            jiesuanshenqing.active = true;
            //显示自己的相关UI信息
            var jiesanTip = jiesuanshenqing.getChildByName("toumingkuang").getChildByName("henkuang").getChildByName("jiesanfangj");
           jiesanTip.getComponent(cc.Sprite).spriteFrame=cc.ResourceMgr.icons["shenqingjiesan"];
            var shenQingName = jiesuanshenqing.getChildByName("shenQname").getComponent(cc.Label);
            shenQingName.string = player.userInfo.szNickName;
            var tishiyu = jiesuanshenqing.getChildByName("tishiyu").getComponent(cc.Sprite);
            tishiyu.spriteFrame = cc.ResourceMgr.icons["tishiyu"];
            jiesuanshenqing.getChildByName("agreeBtn").active = true;
            jiesuanshenqing.getChildByName("disagreeBtn").active = true;
            jiesuanshenqing.getChildByName("queding").active = false;
            cc.ShenQingUserID=player.userInfo.dwUserID;
        }else{
            if (player && player.userInfo){
                console.log("accountInfo.dwUserID"+player.accountInfo.dwUserID);
                cc.GamePrivateMsg.sendSaveAndLeavePrivate();
                cc.GameUserMsg.sendStandUp(player.userInfo.wTableID, player.userInfo.wChairID, 0);
            }
        }
    },

    // 准备按钮点击
    onBtnReadyClicked: function() {
        cc.RoomView.disableReadyBtn();
        cc.RoomView.disableWXInviteBtn();

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer && localPlayer.userInfo && localPlayer.userInfo.wTableID != INVALID_TABLE && localPlayer.userInfo.wChairID != INVALID_CHAIR) {
            cc.GameFrameMsg.sendUserReady(localPlayer.userInfo.dwUserID, localPlayer.userInfo.wTableID, localPlayer.userInfo.wChairID);
        }

        cc.AudioMgr.playSFX("raise.mp3");
    },

    // 加注按钮点击
    onBtnAddScoreClicked: function(event, customEventData) {
        // 关闭、隐藏闹钟
        cc.RoomView.closeClock();
        cc.RoomView.disableAddScoreBtn();
	
        var addScorenum = 0;
        if (customEventData == 1)
            addScorenum = event._currentTarget.addScoreNumber1;
        if (customEventData == 2)
            addScorenum = event._currentTarget.addScoreNumber2;
        cc.GameMgr.sendAddScore(addScorenum);
	
        cc.AudioMgr.playSFX("raise.mp3");
    },

    // 提示牛按钮点击
    onBtnChaKanClicked: function() {
        cc.RoomView.disableHelpBtn();
        
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 计算牛
        var niuniu = [OX_VALUE0, -1, -1];
        if (localUserInfo && localUserInfo.wChairID != INVALID_CHAIR && cc.CardAll) {
            var cards = cc.CardAll[localUserInfo.wChairID];
            if (cards && cards[0])
                niuniu = cc.OxGameLogic.GetCardType(cards, CARD_COUNT);
        }
        var ox = niuniu[0];

        // 选牌且设置为不可点选
        for (var j = 0; j < CARD_COUNT; ++j) {
            if (ox == OX_VALUE0 || j == niuniu[1] || j == niuniu[2])
                cc.RoomView.setCardSelect(localUserInfo.wChairID, localUserInfo.wChairID, j, false, true);
            else
                cc.RoomView.setCardSelect(localUserInfo.wChairID, localUserInfo.wChairID, j, true, true);
        }
        cc.RoomView.setCardsSelectable(localUserInfo.wChairID, localUserInfo.wChairID, false);

        // 设置并显示牛
        cc.RoomView.setCardOx(localUserInfo.wChairID, localUserInfo.wChairID, ox);
        cc.RoomView.enableCardOx(localUserInfo.wChairID, localUserInfo.wChairID);

        // 提示完自动比牌
        this.onBtnBiPaiClicked();
    },

    //显示 申请解散房间失败
    onShowApplyDismissRoomFail: function (data) {
        var jiesanShenQ = cc.find("JiesanShenqing",this.node);
        var jiesanstatus = cc.find("jiesanstatus",this.node);
        jiesanstatus.getChildByName("shenqingfail").active = true;
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if( localPlayer.userInfo.dwUserID != cc.ShenQingUserID ) return ;
        console.log("-- cc.ShenQingUserID"+cc.ShenQingUserID);
        console.log("-- cc-- localPlayer.userInfo.dwUserID"+localPlayer.userInfo.dwUserID);
        jiesanShenQ.active=true;
        var jiesuanfangjian = jiesanShenQ.getChildByName("toumingkuang").getChildByName("henkuang").getChildByName("jiesanfangj").getComponent(cc.Sprite);
        jiesuanfangjian.spriteFrame = cc.ResourceMgr.icons["tip"];
        var tishiyu = jiesanShenQ.getChildByName("tishiyu").getComponent(cc.Sprite);
        tishiyu.spriteFrame = cc.ResourceMgr.icons["shenqingfail"];
        jiesanShenQ.getChildByName("agreeBtn").active=false;
        jiesanShenQ.getChildByName("disagreeBtn").active=false;
        jiesanShenQ.getChildByName("queding").active=true;
    },
    
    onShowApplyDismissRoom: function(data) { //防止一个用户被重复询问
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (!localPlayer || !localPlayer.userInfo)  return;
        var jiesanShenQ = cc.find("JiesanShenqing",this.node);
        var  Displaystatus = true;
        var jiesanstatus = cc.find("jiesanstatus",this.node);
        
           if(data.dwNotAgreeUserCout>0 || data.dwDissUserCout>0){
            //显示同意解散
            jiesanstatus.active=true;
            jiesanstatus.getChildByName("shenqingfail").active=false;
            var tongyinum =jiesanstatus.getChildByName("tongyi").getChildByName("num").getComponent(cc.Sprite);
            tongyinum.spriteFrame = cc.ResourceMgr.shuzi[data.dwDissUserCout+"-"];
            //  显示不同意解散
            var butongyinum =jiesanstatus.getChildByName("jujue").getChildByName("num").getComponent(cc.Sprite);
            butongyinum.spriteFrame = cc.ResourceMgr.shuzi[data.dwNotAgreeUserCout+""];
        }

        //不能用chairID，每个用户的相对位置不一样
        for(var agree =0;agree<data.dwNotAgreeUserCout; ++agree) {
            if(localPlayer.userInfo.dwUserID == data.dwNotAgreeChairID[agree]){
                Displaystatus = false;
                break;
            }
        }
        for(var dontagree =0;dontagree<data.dwDissUserCout; ++dontagree) {
            if(localPlayer.userInfo.dwUserID == data.dwDissChairID[dontagree]){
                Displaystatus = false;
                break;
            }
        }
        
        if(Displaystatus && localPlayer.userInfo.dwUserID != data.dwUserID && (data.dwNotAgreeUserCout>0 || data.dwDissUserCout>0)){
            jiesanShenQ.active=true;
            var shenQname=jiesanShenQ.getChildByName("shenQname").getComponent(cc.Label);
            var playerInfo = cc.PlayerMgr.getPlayer(data.dwUserID);
            shenQname.string = playerInfo.userInfo.szNickName;

            var jiesanTip = jiesanShenQ.getChildByName("toumingkuang").getChildByName("henkuang").getChildByName("jiesanfangj");
            jiesanTip.getComponent(cc.Sprite).spriteFrame=cc.ResourceMgr.icons["shenqingjiesan"];
            var shenQingName = jiesanShenQ.getChildByName("shenQname").getComponent(cc.Label);
            shenQingName.string = playerInfo.userInfo.szNickName;
            var tishiyu = jiesanShenQ.getChildByName("tishiyu").getComponent(cc.Sprite);
            tishiyu.spriteFrame = cc.ResourceMgr.icons["tishiyu"];
            jiesanShenQ.getChildByName("agreeBtn").active = true;
            jiesanShenQ.getChildByName("disagreeBtn").active = true;
            jiesanShenQ.getChildByName("queding").active = false;
        }
     
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 微信邀请、分享
    onBtnWXShareZhanjiClicked:function () {
        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            if (cc.RoomInfo && cc.RoomInfo.dwRoomNum) {
                var _title = "霸王牛牛【房间号：" + cc.RoomInfo.dwRoomNum + "】";
                var _text;

                // 通比牛牛
                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_TONGBINIUNIU)) {
                    _text = "通比牛牛，";
                    _text += cc.RoomInfo.dwPlayTotal + "局，";
                    _text += "底分"
                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                        _text += 20;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                        _text += 40;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                        _text += 60;

                }
                // 牛牛
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_NIUNIU)) {
                    _text = "牛牛，";
                    _text += cc.RoomInfo.dwPlayTotal + "局，";
                    _text += "底分"

                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                        _text += 2;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                        _text += 4;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                        _text += 6;
                }
                // 转转牛牛
                else {
                    _text = "转转牛牛，";
                    _text += "轮庄，";
                    _text += "底分"

                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                        _text += 20;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                        _text += 40;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                        _text += 60;
                }

                _text += "。让我们霸起来！";

                var obj = ztoolSdk.SinySystemStatusManager.create();
                var target = this;
                obj.saveScreenshot(function (succeed, fileName) {
                    if (succeed) {
                        var map = {
                            title: _title,
                            text: _text,
                            url: "http://fir.im/42cj",
                            mediaType: '1',
                            shareTo: '0',
                            imagePath: fileName
                        };
                        target.share_plugin.share(map);
                    }
                });
            }
        }
    },

    onBtnWXInviteClicked:function () {
        if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
            if (cc.RoomInfo && cc.RoomInfo.dwRoomNum) {            
                var _title = "霸王牛牛【房间号：" + cc.RoomInfo.dwRoomNum + "】";
                var _text;

                // 通比牛牛
                if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_TONGBINIUNIU)) {
                    _text = "通比牛牛，";
                    _text += cc.RoomInfo.dwPlayTotal + "局，";
                    _text += "底分"
                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                        _text += 20;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                        _text += 40;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                        _text += 60;

                }
                // 牛牛
                else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_NIUNIU)) {
                    _text = "牛牛，";
                    _text += cc.RoomInfo.dwPlayTotal + "局，";
                    _text += "底分"

                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                        _text += 2;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                        _text += 4;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                        _text += 6;
                }
                // 转转牛牛
                else {
                    _text = "转转牛牛，";
                    _text += "轮庄，";
                    _text += "底分"

                    if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1))
                        _text += 20;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2))
                        _text += 40;
                    else if (cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3))
                        _text += 60;
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
    },

    onShareResult:function (code,msg) {
        cc.log("share result, resultcode:"+code+", msg:"+msg);
        switch (code)
        {
            case anysdk.ShareResultCode.kShareSuccess:
                cc.log('分享成功');
                break;
            case anysdk.ShareResultCode.kShareFail:
                cc.log('分享失败');
                break;
            case anysdk.ShareResultCode.kShareCancel:
                cc.log('分享取消');
                break;
            case anysdk.ShareResultCode.kShareNetworkError:
                cc.log('网络错误');
                break;
        }
    },

    onBtnDismissRoomClicked: function(CustomEventData) {

         var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (!localPlayer || !localPlayer.userInfo)  return;
        //解散房间确定按钮
        var jiesuanshenqing = cc.find("JiesanShenqing",this.node);
        //发送申请解散房间
         cc.GamePrivateMsg.sendAcquireDismissroom(cc.ShenQingUserID,1);
        jiesuanshenqing.active = false;
    },

    //房间解散失败 确定按钮 隐藏所有的UI
    onBtnQuedingClicked: function(CustomEventData) {
        var jiesuanshenqing = cc.find("JiesanShenqing",this.node);
        jiesuanshenqing.active=false;
        var jiesanstatus = cc.find("jiesanstatus",this.node);
        jiesanstatus.getChildByName("shenqingfail").active=false;
        jiesanstatus.active=false;
    },

    onBtnDismissRoomJujueClicked: function(CustomEventData) {
        //解散房间确定按钮
        var jiesuanshenqing = cc.find("JiesanShenqing",this.node);
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if(localPlayer.userInfo.dwUserID == cc.ShenQingUserID ){
            console.log("localPlayer.userInfo.dwUserID == cc.ShenQingUserID");
            jiesuanshenqing.active = false;
        }
        else{
            cc.GamePrivateMsg.sendAcquireDismissroom(cc.ShenQingUserID,0);
            jiesuanshenqing.active = false;
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 打开扎鸟界面
    openZhaNiaoUI: function() {
        var node = cc.find("zaniao", this.node);

        this.onSelectZaNiaoUserClicked(0, 3);
        this.onSelectZaNiaoScoreClicked(0, 1);
        if (node.currperson) node.currperson.toggle.check();
        this.onSelectZaNiaoUserClicked(0, 2);
        this.onSelectZaNiaoScoreClicked(0, 1);
        if (node.currperson) node.currperson.toggle.check();
        this.onSelectZaNiaoUserClicked(0, 1);
        this.onSelectZaNiaoScoreClicked(0, 1);
        if (node.currperson) node.currperson.toggle.check();

        var cnt = 0;
        for (var i = 0; i <= 3; ++i) {
            if (i != cc.ZhuangJia) {
                var player = cc.PlayerMgr.getPlayerByChairID(i);
                if (player && player.userInfo) {
                    var p = cc.find("person" + cnt, node);
                    p.getChildByName("name").getComponent(cc.Label).string = player.userInfo.szNickName;

                    var icon = p.getChildByName("touxiang").getComponent(cc.Sprite);
                    if (player.individualInfo && player.individualInfo.szHeadHttp && player.individualInfo.szHeadHttp.length > 0) {
                        if (cc.ResourceMgr.icons[player.individualInfo.szHeadHttp])
                            icon.spriteFrame = cc.ResourceMgr.icons[player.individualInfo.szHeadHttp];
                        else {
                            cc.loader.load(player.individualInfo.szHeadHttp, function (err, tex) {
                                if (tex) {
                                    var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
                                    icon.spriteFrame = spriteFrame;
                                    cc.ResourceMgr.icons[player.individualInfo.szHeadHttp] = spriteFrame;
                                }
                            });
                        }
                    }
                }
                ++cnt;
            }
        }

        node.active = true;
    },

    // 关闭抓鸟界面
    onClickCloseZhuaNiao:function () {
        var node = cc.find("zaniao", this.node);

        this.onSelectZaNiaoUserClicked(0, 3);
        this.onSelectZaNiaoScoreClicked(0, 1);
        if (node.currperson) node.currperson.toggle.check();
        this.onSelectZaNiaoUserClicked(0, 2);
        this.onSelectZaNiaoScoreClicked(0, 1);
        if (node.currperson) node.currperson.toggle.check();
        this.onSelectZaNiaoUserClicked(0, 1);
        this.onSelectZaNiaoScoreClicked(0, 1);
        if (node.currperson) node.currperson.toggle.check();
        
        node.active = false;

        this.onBtnZaNiaoAddScoreClicked();
    },

    // 选择扎鸟用户
    onSelectZaNiaoUserClicked:function (event,customEventData) {
        var node=cc.find("zaniao",this.node);
        if(1==customEventData)
        {
            // 实现头像遮罩特效
            cc.find("person0/mask",node).active=false;
            cc.find("person1/mask",node).active=true;
            cc.find("person2/mask",node).active=true;
            node.currperson = cc.find("person0",node);

        }
        else if (2==customEventData)
        {
            cc.find("person1/mask",node).active=false;
            cc.find("person0/mask",node).active=true;
            cc.find("person2/mask",node).active=true;
            node.currperson = cc.find("person1",node);
        }
        else
        {
            cc.find("person2/mask",node).active=false;
            cc.find("person0/mask",node).active=true;
            cc.find("person1/mask",node).active=true;
            node.currperson = cc.find("person2",node);
        }

        var numArray = null;
        if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_TYPE_ZHUANZHUANNIUNIU)){
            if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_1)) {
                numArray = [5, 10, 15];
            }
            if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_2)) {
                numArray = [10, 15, 20];
            }
            if(cc.FvMask.hasAny(cc.RoomInfo.bGameRuleIdex, GAME_RULE_BASESCORE_3)) {
                numArray = [20, 25, 30];
            }
        }
        else
            numArray = [cc.TuiZhuMax/2, cc.TuiZhuMax, cc.TuiZhuMax/2*3];
        this.updateButtonNum(numArray);

        if (node.currperson.toggle) {
            node.currperson.toggle.check();
        }
        else {
            this.onSelectZaNiaoScoreClicked(0, 1);
            node.currperson.toggle.check();
        }
    },

    // 更新每一个扎鸟按钮的数字
    updateButtonNum: function(numArray) {
        // 写每一个按钮的数值
        var node = cc.find("zaniao", this.node);
        for(var i=0; i < 3; ++i)
        {
            var name=i+2;
            var lblNum = cc.find("toggleGroup/toggle" + name + "/Background/lblNum", node).getComponent(cc.Label);
            lblNum.score = numArray[i];
            lblNum.string=numArray[i]+"";
            var shu1 = cc.find("toggleGroup/toggle" + name + "/Background/shu1", node).getComponent(cc.Sprite);
            var shu2 = cc.find("toggleGroup/toggle" + name + "/Background/shu2", node).getComponent(cc.Sprite);
            shu1.spriteFrame=cc.ResourceMgr.fenshuNumber[parseInt(numArray[i]/10)+""];
            shu2.spriteFrame=cc.ResourceMgr.fenshuNumber[parseInt(numArray[i]%10)+""];
        }
    },

    // 选择扎鸟分数
    onSelectZaNiaoScoreClicked: function(event, customEventData) {
        var node = cc.find("zaniao", this.node);
        var toggle = cc.find("toggleGroup/toggle" + customEventData, node);
        node.currperson.toggle = toggle.getComponent(cc.Toggle);
        if (customEventData == 1) {
            node.currperson.score = 0;
        }
        else {
            var lblNum = cc.find("/Background/lblNum", toggle).getComponent(cc.Label);
            node.currperson.score = lblNum.score;
        }
    },

    //点击扎鸟按钮 加注 扎鸟的消息和真实玩家的加注消息是同一时刻的
    //如果不扎鸟 所有的值传0，
    onBtnZaNiaoAddScoreClicked: function(event, customEventData) {
        var node=cc.find("zaniao",this.node);
        var p0 = cc.find("person0",node);
        var p1 = cc.find("person1",node);
        var p2 = cc.find("person2",node);
        var score = [0, 0, 0, 0, 0, 0];
        score[0] = p0.score > 0 ? p0.score : 0;
        score[1] = p1.score > 0 ? p1.score : 0;
        score[2] = p2.score > 0 ? p2.score : 0;
        var chairID = [-1, -1, -1, -1, -1, -1];
        var cnt = 0;
        for (var i = 0; i <= 3; ++i) {
            if (i != cc.ZhuangJia) {
                chairID[cnt] = i;
                ++cnt;
            }
        }
        var score2 = [0, 0, 0, 0, 0, 0];
        if (chairID[0] >= 0) score2[chairID[0]] = score[0];
        if (chairID[1] >= 0) score2[chairID[1]] = score[1];
        if (chairID[2] >= 0) score2[chairID[2]] = score[2];
        cc.GameMgr.sendZaniaoScore(chairID, score2, 3);
        cc.find("zaniao",this.node).active=false;
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 比牌按钮点击
    onBtnBiPaiClicked: function() {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 计算牛
        var niuniu = [OX_VALUE0, -1, -1];
        if (localUserInfo && localUserInfo.wChairID != INVALID_CHAIR && cc.CardAll) {
            var cards = cc.CardAll[localUserInfo.wChairID];
            if (cards && cards[0])
                niuniu = cc.OxGameLogic.GetCardType(cards, CARD_COUNT);
        }
        var ox = niuniu[0];

        // 如果没牛直接摊牌
        if (ox <= OX_VALUE0) {
            ox = OX_VALUE0;

            // 取消选择并设置为不可点选
            cc.RoomView.setCardsSelect(localUserInfo.wChairID, localUserInfo.wChairID, false, true);
            cc.RoomView.setCardsSelectable(localUserInfo.wChairID, localUserInfo.wChairID, false);

            // 设置并显示牛
            cc.RoomView.setCardOx(localUserInfo.wChairID, localUserInfo.wChairID, ox);
            cc.RoomView.enableCardOx(localUserInfo.wChairID, localUserInfo.wChairID);

            // 摊牌
            cc.GameMgr.sendOpenCard(0);

            // 关闭、隐藏闹钟
            cc.RoomView.closeClock();
            cc.RoomView.disableHelpBtn();
            cc.RoomView.disableOpenBtn();
        }
        else {
            // 判断用户牛是否选错
            var sum = 0;
            var cnt = 0;
            for (var j = 0; j < CARD_COUNT; ++j) {
                if (cc.RoomView.isCardSelected(localUserInfo.wChairID, localUserInfo.wChairID, j)) {
                    var val = cc.RoomView.getCard(localUserInfo.wChairID, localUserInfo.wChairID, j);
                    if (val > 10) val = 10;
                    sum += val;
                    cnt++;
                }
            }

            // 是否选对
            var good = true;
            if (cnt < 3)
                good = false;
            else if (cnt == 3) {
                if (sum%10 != 0)
                    good = false;
            }
            else {
                if (sum <= 10 || sum%10 != 0)
                    good = false;
            }

            // 如果选错则重选
            if (!good) {
                // 取消选择并设置为可点选
                cc.RoomView.setCardsSelect(localUserInfo.wChairID, localUserInfo.wChairID, false, true);
                cc.RoomView.setCardsSelectable(localUserInfo.wChairID, localUserInfo.wChairID, true);
            }
            // 如果选对则摊牌
            else {
                // 设置为不可点选
                cc.RoomView.setCardsSelectable(localUserInfo.wChairID, localUserInfo.wChairID, false);

                // 设置并显示牛
                cc.RoomView.setCardOx(localUserInfo.wChairID, localUserInfo.wChairID, ox);
                cc.RoomView.enableCardOx(localUserInfo.wChairID, localUserInfo.wChairID);

                // 摊牌
                cc.GameMgr.sendOpenCard(1);

                // 关闭、隐藏闹钟
                cc.RoomView.closeClock();
                cc.RoomView.disableHelpBtn();
                cc.RoomView.disableOpenBtn();
            }
        }

        cc.AudioMgr.playSFX("raise.mp3");
    },
});
