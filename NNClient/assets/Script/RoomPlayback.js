cc.Class({
    extends: cc.Component,

    properties: {
        TotalRecord: null,
        TimeAccum: 0.0,
        Playing: false,
        PlaySpeed: 1.0,
        CurrStep: -1,
    },

    // 初始化
    onLoad: function () {
        cc.RoomPlayback = this;
    },

    // 启用
    start: function() {
        if (!this.TotalRecord) return;

        cc.AudioMgr.playBGM("roomBgm.mp3");

        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer === null) return;

        var localUserInfo = localPlayer.userInfo;
        for (var i = 0; i < this.TotalRecord.kUserIDSize; ++i) {
            var userId = this.TotalRecord.kUserID[i];
            if (userId) {
                if (localUserInfo.dwUserID == userId) {
                    localUserInfo.wChairID = i;
                    break;
                }
            }
        }

        // 查询玩家帐号信息
        for (var i = 0; i < this.TotalRecord.kUserIDSize; ++i) {
            var userId = this.TotalRecord.kUserID[i];
            if (userId) {
                cc.UserServiceMsg.sendQueryAccountInfo(userId);
            }
        }
    },

    // 退出
    onDisable: function() {
        if (this.TotalRecord === null) return;

        // 退出游戏回放房间后, 需要清理掉房间内玩家信息
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer === null) return;
        
        var localUserInfo = localPlayer.userInfo;
        localUserInfo.wChairID = INVALID_CHAIR;

        for (var key in cc.PlayerMgr.players) {
			if (key) {
				var player = cc.PlayerMgr.players[key];
				if (!player.userInfo || player.userInfo.dwUserID != cc.PlayerMgr.localPlayerId)
					player.userInfo = null;
			}
		}

        // 关闭各UI到相应初始状态
        cc.RoomView.disableAll();

        this.TotalRecord = null;
    },

    // called every frame
    update: function (dt) {
        if (this.Playing) {
            var interval = 1.0 / this.PlaySpeed;

            this.TimeAccum += dt;
            if (this.TimeAccum >= interval) {
                this.TimeAccum = 0.0;
                this.play(this.CurrStep + 1);
            }
        }
    },

    play: function(step) {
        if (this.TotalRecord === null) return;
        if (step < 0) step = 0;

        // 重置界面
        cc.RoomView.clearAllGoldsAnims();
        for (var i = 0; i < PLAYER_COUNT; ++i) {
            // 重置玩家金币
            cc.RoomView.setPlayerGold(0, i, 0);
            // 隐藏加注金币图片
            cc.RoomView.disableAddScoreGold(0, i);
            // 隐藏桌面上的牌
            cc.RoomView.disableCards(0, i);
            // 隐藏牌上完成、牛牛结果、得分图片
            cc.RoomView.disableCardFinish(0, i);
            cc.RoomView.disableCardOx(0, i);
            cc.RoomView.disableCardScore(0, i);
        }
        
        // 找到本地玩家椅子ID
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer === null) return;
        var localUserInfo = localPlayer.userInfo;
        if (!localUserInfo || localUserInfo.wChairID == INVALID_CHAIR)
            return;

        // 整理并找到当前局与步骤序列
        var junum= 0;
        var players = [];
        var actions = [];
        var cnt = -1;
        for (var i = 0; i < this.TotalRecord.kRecordChildSize && cnt !== step; ++i) {
            var kRecordChild = this.TotalRecord.kRecordChild[i];
            var kNNGameRecord = kRecordChild.kNNGameRecord;
            players = kNNGameRecord.kPlayers;

            ++junum;
            actions = [];
            for (var j = 0; j < kNNGameRecord.kActionSize && cnt !== step; ++j) {
                actions[j] = kNNGameRecord.kAction[j];
                ++cnt;
            }

            if (cnt != step) {
                for (var j = 0; j < kRecordChild.kScoreSize; ++j) {
                    var kScore = kRecordChild.kScore[j];
                    cc.RoomView.addPlayerGold(localUserInfo.wChairID, j, kScore);
                }
            }
        }

        if (step !== cnt || players.length <= 0 || actions.length <= 0) {
            if (cnt >= 0 && players.length > 0 && actions.length > 0)
                this.play(0);
            return;
        }
        this.CurrStep = step;
        
        // 执行步骤序列
        var bankerChairID = -1;
        var cardsAll = [];
        for (var i = 0; i < 6; ++i) cardsAll[i] = [];
        for (var i = 0; i < actions.length; ++i) {
            var isCurr = i === (actions.length - 1);
            var action = actions[i];
            
            // 叫庄
            if (action.cbActionType == ACTION_TYPE_PickZhuang) {
                if (action.lUserID && action.lUserID.length) {
                    var player = cc.PlayerMgr.getPlayer(action.lUserID[0]);
                    if (player.userInfo && player.userInfo.wChairID != INVALID_CHAIR) {
                        // 设置局数
                        cc.find("Playback/tips", this.node).getComponent(cc.Label).string = "第 " + junum +  " 局";

                        // 设置庄家
                        cc.RoomView.setBanker(localUserInfo.wChairID, player.userInfo.wChairID);
                        bankerChairID = player.userInfo.wChairID;

                        // 设置所有牌
                        for (var j = 0; j < players.length; ++j) {
                            var _player = players[j];
                            if (_player.dwUserID && _player.cbCardData) {
                                var cards = _player.cbCardData;
                                if (cards.length > 0 && cards[0]) {
                                    var __player = cc.PlayerMgr.getPlayer(_player.dwUserID);
                                    if (__player.userInfo) {
                                        var chairID = __player.userInfo.wChairID;
                                        if (chairID != INVALID_CHAIR) {
                                            cardsAll[chairID] = cards;

                                            // 设置一个位置的牌, 全部玩家的牌面不可见, 不可选择
                                            cc.RoomView.setCardsVis(localUserInfo.wChairID, chairID, false);
                                            cc.RoomView.setCards(localUserInfo.wChairID, chairID, cards);
                                            cc.RoomView.setCardsSelectable(localUserInfo.wChairID, chairID, false);
                                            cc.RoomView.enableCards(localUserInfo.wChairID, chairID);
                                        }
                                    }
                                }
                            }
                        }

                        if (isCurr)
                            cc.AudioMgr.playSFX("fapai.mp3");
                    }
                }
            }
            // 摊牌
            else if (action.cbActionType == ACTION_TYPE_OutCard) {
                if (action.lUserID && action.lUserID.length) {
                    var lUserID = action.lUserID[0];
                    var bOx = action.bOx;

                    var player = cc.PlayerMgr.getPlayer(lUserID);
                    if (player.userInfo) {
                        var chairID = player.userInfo.wChairID;
                        if (chairID != INVALID_CHAIR) {
                            var cards = cardsAll[chairID];
                            if (cards.length && cards[0]) {
                                // 如果用户自己标识为没牛, 那么就没牛
                                var ox = bOx > 0 ? cc.OxGameLogic.GetCardType(cards, CARD_COUNT)[0] : OX_VALUE0;
                                cc.RoomView.setCardOx(localUserInfo.wChairID, chairID, ox);
                                cc.RoomView.enableCardOx(localUserInfo.wChairID, chairID);
                                cc.RoomView.setCardsVis(localUserInfo.wChairID, chairID, true);

                                // 播放牛语音
                                if (isCurr) {
                                    var prefix = "manbull";
                                    if (player.userInfo.cbGender != 1) prefix = "womanbull";
                                    cc.AudioMgr.playSFX(prefix + ox + ".mp3");
                                }
                            }
                        }
                    }
                }
            }
            // 得分
            else if (action.cbActionType == ACTION_TYPE_Score) {
                var lGameScore = action.lGameScore;
                for (var j = 0; j < lGameScore.length; ++j) {
                    var UserID = lGameScore[j].UserID;
                    var GameScore = lGameScore[j].GameScore;
                    if (GameScore) {
                        var player = cc.PlayerMgr.getPlayer(UserID);
                        if (player.userInfo) {
                            var chairID = player.userInfo.wChairID;
                            if (chairID != INVALID_CHAIR) {
                                // 显示得分
                                cc.RoomView.setCardScore(localUserInfo.wChairID, chairID, GameScore);
                                cc.RoomView.enableCardScore(localUserInfo.wChairID, chairID);

                                // 金币动画
                                if (isCurr && bankerChairID >= 0) {
                                    if (chairID != bankerChairID)
                                        cc.RoomView.spawnGoldsAnimChairID(localUserInfo.wChairID, bankerChairID, chairID, GameScore);
                                }
                                else {
                                    cc.RoomView.addPlayerGold(localUserInfo.wChairID, chairID, GameScore);
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // 网络层更新玩家用户信息
    onUpdatePlayerInfo: function(player) {
        if (this.TotalRecord === null) return;

        // 手工构造填充一个 userInfo
        var accountInfo = player.accountInfo;
        player.userInfo = accountInfo;
        for (var i = 0; i < this.TotalRecord.kUserIDSize; ++i) {
            var userId = this.TotalRecord.kUserID[i];
            if (userId) {
                if (player.userInfo.dwUserID == userId) {
                    player.userInfo.wChairID = i;
                }
            }
        }
        var userInfo = player.userInfo;

        if (userInfo.wChairID != INVALID_CHAIR) {
            var localPlayer = cc.PlayerMgr.getPlayer(0);
            if (localPlayer === null) return;

            var localUserInfo = localPlayer.userInfo;

            // 如果尚未设置则初始设置玩家信息并显示
            if (cc.RoomView.isPlayerInfoEnabled(localUserInfo.wChairID, userInfo.wChairID) != true) {
                cc.RoomView.setPlayerInfo(localUserInfo.wChairID, userInfo.wChairID, userInfo, player);
                cc.RoomView.enablePlayerInfo(localUserInfo.wChairID, userInfo.wChairID);
            }

            var individualInfo = player.individualInfo;
            if (localUserInfo && userInfo && individualInfo)
                cc.RoomView.setPlayerIndividual(localUserInfo.wChairID, userInfo.wChairID, individualInfo);
        }

        // 如果都查询到了, 则显示播放控制面板
        var allOk = true;
        for (var i = 0; i < this.TotalRecord.kUserIDSize; ++i) {
            var userId = this.TotalRecord.kUserID[i];
            if (userId) {
                if (player.userInfo.wChairID && player.userInfo.wChairID >= 0 && player.userInfo.wChairID < PLAYER_COUNT)
                    ;
                else
                    allOk = false;
            }
        }

        if (allOk) {
            cc.find("Playback", this.node).active = true;
            this.play(0);
            this.onBtnBoFangClicked();
        }
    },

    // 后退按钮点击
    onBtnPrevClicked: function() {
        if (this.TotalRecord === null) return;

        cc.director.loadScene("Home");
    },

    // 播放
    onBtnBoFangClicked: function() {
        cc.find("Playback/tips/bg/bofang", this.node).active = false;
        cc.find("Playback/tips/bg/zanting", this.node).active = true;
        this.Playing = true;
    },

    // 暂停
    onBtnZanTingClicked: function() {
        cc.find("Playback/tips/bg/zanting", this.node).active = false;
        cc.find("Playback/tips/bg/bofang", this.node).active = true;
        this.Playing = false;
    },

    // 左箭头
    onBtnZuoJianTouClicked: function() {
        if (this.Playing)
            this.PlaySpeed /= 2.0;
        else
            this.play(this.CurrStep - 1);
    },

    // 右箭头
    onBtnYouJianTouClicked: function() {
        if (this.Playing)
            this.PlaySpeed *= 2.0;
        else
            this.play(this.CurrStep + 1);
    },

    // 返回
    onBtnFanHuiClicked: function() {
        this.play(0);
    },
});
