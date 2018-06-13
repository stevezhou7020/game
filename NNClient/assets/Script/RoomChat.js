
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.RoomChat = this;
    },
    
    // 启用
    start: function() {
        cc.find("Misc/yuyin", this.node).on("touchstart", this.onTalkPress, this);
        cc.find("Misc/yuyin", this.node).on("touchend", this.onTalkRelease, this);
        cc.find("Misc/yuyin", this.node).on("touchcancel", this.onTalkCancel, this);
        cc.find("Misc/liaotian", this.node).active = true;
        cc.find("Misc/yuyin", this.node).active = true;
    },

    spawnPicAnim: function(spriteFrame, srcX, srcY, dstX, dstY) {
        if (spriteFrame) {
            var prefabSprite = cc.ResourceMgr.prefab["PrefabSprite"];
            if (prefabSprite) {
                var instanceSprite = cc.instantiate(prefabSprite);
                var sprite = instanceSprite.getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;

                instanceSprite.x = srcX;
                instanceSprite.y = srcY;
                instanceSprite.scaleX = 0;
                instanceSprite.scaleY = 0;
                instanceSprite.parent = this.node;

                var seq = cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1.25, 1.25),
                        cc.moveTo(0.5, dstX, dstY),
                    ),
                    cc.delayTime(1.0),
                    cc.fadeOut(0.5),
                    );
                instanceSprite.runAction(seq);
            }
        }
    },

    onPlayerExpression: function(exprId, senderPlayer, targetPlayer) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;

        // 礼物表情
        if (exprId < 100 && targetPlayer) {
            var liwuName;
            var sizeName = "2";
            switch (exprId) {
                case LIWU_SHIT:
                    liwuName = "shit" + sizeName;
                    break;
                case LIWU_HUA:
                    liwuName = "hua" + sizeName;
                    break;
                case LIWU_CHUN:
                    liwuName = "chun" + sizeName;
                    break;
                case LIWU_XIE:
                    liwuName = "xie" + sizeName;
                    break;
            }

            // 玩家在客户端的位置
            var senderUserInfo = senderPlayer.userInfo;
            var targetUserInfo = targetPlayer.userInfo;
            var senderChairIdx = (senderUserInfo.wChairID - localUserInfo.wChairID + PLAYER_COUNT) % PLAYER_COUNT;
            var targetChairIdx = (targetUserInfo.wChairID - localUserInfo.wChairID + PLAYER_COUNT) % PLAYER_COUNT;

            // 不能自己给自己发
            if (senderChairIdx != targetChairIdx) {
                var senderPlayerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + senderChairIdx, this.node);
                var targetPlayerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + targetChairIdx, this.node);
                this.spawnPicAnim(cc.ResourceMgr.liwu[liwuName], senderPlayerInfo.x, senderPlayerInfo.y, targetPlayerInfo.x, targetPlayerInfo.y);
                cc.AudioMgr.playSFX("card.mp3");
            }
        }
        else {
            // 玩家在客户端的位置
            var senderUserInfo = senderPlayer.userInfo;
            var senderChairIdx = (senderUserInfo.wChairID - localUserInfo.wChairID + PLAYER_COUNT) % PLAYER_COUNT;
            var senderChat = cc.find("PlayerIcon/Chat" + senderChairIdx, this.node);
            var wenzi = senderChat.getChildByName("jieshouliaotian").getChildByName("wenzi");
            var jieshoukuang = senderChat.getChildByName("jieshouliaotian");
            jieshoukuang.active = false;
            wenzi.active = false;
            var laba = senderChat.getChildByName("laba");
            laba.active = false;
            var biaoqing = senderChat.getChildByName("biaoqing");
            biaoqing.active = false;
            
            // 常用语
            if (exprId < SENTENCE_TEXT_BASE + 100) {
                var idx = exprId - SENTENCE_TEXT_BASE;

                // 文字
                wenzi.getComponent(cc.Label).string = SENTENCE[idx];
                wenzi.stopAllActions();
                jieshoukuang.active = true;
                wenzi.active = true;
                var seq = cc.sequence(
                    cc.fadeIn(0),
                    cc.delayTime(2.0),
                    cc.fadeOut(0.5),
                    );
                jieshoukuang.runAction(seq);

                // 短语音
                laba.stopAllActions();
                laba.active = true;
                var seq = cc.sequence(
                    cc.fadeIn(0),
                    cc.delayTime(2.0),
                    cc.fadeOut(0.5),
                    );
                laba.runAction(seq);
                
                var id = idx + 1;
                cc.AudioMgr.playSFX("yy" + id + ".mp3");
            }
            // 表情
            else if (exprId < EXPRESSION_BASE + 100) {
                biaoqing.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.biaoqing[exprId - EXPRESSION_BASE];
                biaoqing.stopAllActions();
                biaoqing.active = true;
                var seq = cc.sequence(
                    cc.fadeIn(0),
                    cc.delayTime(2.0),
                    cc.fadeOut(0.5),
                    );
                biaoqing.runAction(seq);
            }
            
            senderChat.active = true;
        }
    },

    onChatClicked: function() {
        var frame = this.node.getChildByName("liaotian");
        var changyongyu = frame.getChildByName("changyongyu");
        changyongyu.active = true;
        var biaoqing = frame.getChildByName("biaoqing");
        biaoqing.active = false;
        frame.active = true;
    },

    onChatTabClick: function(event, customEventData) {
        var frame = this.node.getChildByName("liaotian");
        var changyongyu = frame.getChildByName("changyongyu");
        changyongyu.active = customEventData == 0 ? true : false;
        var biaoqing = frame.getChildByName("biaoqing");
        biaoqing.active = customEventData == 1 ? true : false;
    },

    onChatCloseClick: function() {
        var frame = this.node.getChildByName("liaotian");
        frame.active = false;
    },

    onSentenceTextClick: function(event, customEventData) {
        this.node.getChildByName("liaotian").active = false;
        cc.GameUserMsg.sendUserExpression(SENTENCE_TEXT_BASE + parseInt(customEventData), 0);
    },

    onExpressionClick: function(event, customEventData) {
        this.node.getChildByName("liaotian").active = false;
        var btn = event.target;
        var spr = btn.getComponent(cc.Sprite).spriteFrame;
        var id = parseInt(spr.name);
        cc.GameUserMsg.sendUserExpression(EXPRESSION_BASE + id, 0);
    },

    //---------------------------------------------------------------------------------
    // 语音聊天
    onTalkPress: function(event, customEventData) {
        cc.AudioMgr.pauseAll();
        ZUtils.getInstance().startSoundRecord();
    },

    onTalkRelease: function(event, customEventData) {
        cc.AudioMgr.resumeAll();

        var filename = ZUtils.getInstance().stopSoundRecord();
        if (filename && filename.length) {
            var amrFilename = null;
            if (filename.endsWith(".wav")) {
                amrFilename = filename.replace(".wav", ".amr");
                ZUtils.getInstance().wavToAmr(filename, amrFilename);
            }
            else
                amrFilename = filename;

            if (amrFilename && amrFilename.length) {
                var amrData = ZUtils.getInstance().getFileData(amrFilename);
                cc.GameFrameMsg.sendTableTalk(cc.PlayerMgr.getLocalPlayerId(), amrData);
            }
        }
    },

    onTalkCancel: function(event, customEventData) {
        ZUtils.getInstance().stopSoundRecord();
        cc.AudioMgr.resumeAll();
    },

    onTableTalk: function(data) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (!localPlayer) return;
        var localUserInfo = localPlayer.userInfo;
        if (!localUserInfo || localUserInfo.wChairID == INVALID_CHAIR) return;

        var senderPlayer = cc.PlayerMgr.getPlayer(data.dwUserID);
        if (!senderPlayer) return;
        var senderUserInfo = senderPlayer.userInfo;
        if (!senderUserInfo || senderUserInfo.wChairID == INVALID_CHAIR) return;

        // 喇叭动画
        var senderChairIdx = (senderUserInfo.wChairID - localUserInfo.wChairID + PLAYER_COUNT) % PLAYER_COUNT;
        var senderChat = cc.find("PlayerIcon/Chat" + senderChairIdx, this.node);
        var wenzi = senderChat.getChildByName("jieshouliaotian").getChildByName("wenzi");
        var jieshoukung = senderChat.getChildByName("jieshouliaotian");
        jieshoukung.active = false;
        wenzi.active = false;
        var laba = senderChat.getChildByName("laba");
        laba.active = false;
        var biaoqing = senderChat.getChildByName("biaoqing");
        biaoqing.active = false;

        laba.stopAllActions();
        laba.active = true;
        var seq = cc.sequence(
            cc.fadeIn(0),
            cc.delayTime(2.0),
            cc.fadeOut(0.5),
            );
        laba.runAction(seq);
        senderChat.active = true;

        // 播放语音
        var amrFilename = ZUtils.getInstance().saveAmrFile(data.cbData);
        if (amrFilename && amrFilename.length) {
            var wavFilename = amrFilename.replace(".amr", ".wav");
            if (wavFilename && wavFilename.length) {
                ZUtils.getInstance().amrToWav(amrFilename, wavFilename);
                senderPlayer.yuyinId = wavFilename;
                cc.AudioMgr.playWAV(wavFilename, true);
            }
        }
    }
});
