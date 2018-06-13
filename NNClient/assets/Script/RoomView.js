
// 房间场景显示层
//      游戏房间内全部界面的直接操作代码都必须写到这个类里面,
//      用来给游戏房间内玩法逻辑、游戏房间内回放逻辑等公用
//
//      原则上, 该类包含且只能包含全部的最直接的打开、关闭、设置房间内各UI的界面操作代码
//      不能有任何涉及到实际游戏逻辑的代码, 反之亦然, 否则一定会写乱啊
//
//      原则上, 该类里每一个成员方法都只能完成一个最直接、简单的操作，如打开、关闭、设置一个UI元素
//      每一个成员方法都尽量保持简单直接, 与上下文、状态无关, 不与其它成员方法有耦合
//      如：打开、关闭方法就只是打开、关闭一个UI元素, 而设置方法就只是设置某一个UI元素的属性，设置方法里不能有打开、关闭操作等

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function() {
        cc.RoomView = this;
    },
    
    //-------------------------------------------------------------------------
    // 服务器椅子ID到本地显示层椅子下标
    getChairIdx: function(localChairID, chairID) {
        return (chairID - localChairID + PLAYER_COUNT) % PLAYER_COUNT;
    },

    // 关闭所有UI到相应初始状态
    disableAll: function() {
        // 隐藏房间信息
        this.disableRoomInfo();

        for (var i = 0; i < PLAYER_COUNT; ++i) {
            // 隐藏玩家信息
            this.disablePlayerInfo(0, i);

            // 隐藏加注金币图片
            this.disableAddScoreGold(0, i);

            // 隐藏桌面上的牌
            this.disableCards(0, i);
            
            // 隐藏牌上完成、牛牛结果、得分图片
            this.disableCardFinish(0, i);
            this.disableCardOx(0, i);
            this.disableCardScore(0, i);
        }

        // 关闭、隐藏闹钟
        this.closeClock();

        // 隐藏提示和比牌按钮
        this.disableHelpBtn();
        this.disableOpenBtn();
        
        // 隐藏准备、下注按钮
        this.disableReadyBtn();
        this.disableAddScoreBtn();
    },

    //-------------------------------------------------------------------------
    // 闹钟
    startClock: function(duration) {
        this.closeClock();

        var clock = cc.find("Clock", this.node);
        if (clock.callback) this.unschedule(clock.callback);
        clock.duration = duration;
        clock.count = duration;
        clock.callback = function() {
            clock.count--;
            if (clock.count >= 0 && clock.count <= 9) {
                clock.getChildByName("num").getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.clockNumber[clock.count];
                clock.active = true;
                cc.AudioMgr.playSFX("raise.mp3");
            }
        }
        this.schedule(clock.callback, 1, clock.duration*2);
    },

    restartClock: function() {
        var clock = cc.find("Clock", this.node);
        if (clock.callback) this.unschedule(clock.callback);
        if (clock.duration > 0 && clock.callback) {
            clock.active = false;
            clock.count = clock.duration;
            this.schedule(clock.callback, 1, clock.duration*2);
        }
    },

    closeClock: function() {
        var clock = cc.find("Clock", this.node);
        if (clock.callback) this.unschedule(clock.callback);
        clock.duration = 0;
        clock.callback = null;
        clock.active = false;
    },

    //-------------------------------------------------------------------------
    // 金币动画
    spawnGoldAnim: function(spriteFrame, srcX, srcY, dstX, dstY) {
        var prefabSprite = cc.ResourceMgr.prefab["PrefabSprite"];
        if (prefabSprite) {        
            srcX += (Math.random() * 2 - 1) * 20;
            srcY += (Math.random() * 2 - 1) * 20;
            dstX += (Math.random() * 2 - 1) * 20;
            dstY += (Math.random() * 2 - 1) * 20;

            var instanceSprite = cc.instantiate(prefabSprite);
            var sprite = instanceSprite.getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;

            instanceSprite.x = srcX;
            instanceSprite.y = srcY;
            instanceSprite.parent = this.node.getChildByName("PlayerIcon");

            var seq = cc.sequence(
                cc.moveTo(0.5, dstX, dstY),
                cc.fadeOut(0)
                );
            instanceSprite.runAction(seq);
        }
    },

    spawnGoldsAnim: function(bankerNode, playerNode, score) {
        var bankerJinbi = bankerNode.getChildByName("jinbi").getComponent(cc.Label);
        var playerJinbi = playerNode.getChildByName("jinbi").getComponent(cc.Label);

        var srcJinbi, dstJinbi;
        var srcX, srcY;
        var dstX, dstY;
        if (score > 0) {
            srcJinbi = bankerJinbi;
            dstJinbi = playerJinbi;
            srcX = bankerNode.x;
            srcY = bankerNode.y;
            dstX = playerNode.x;
            dstY = playerNode.y;
        }
        else {
            srcJinbi = playerJinbi;
            dstJinbi = bankerJinbi;
            srcX = playerNode.x;
            srcY = playerNode.y;
            dstX = bankerNode.x;
            dstY = bankerNode.y;
        }

        var num = Math.abs(score);
        var interval = 0.1;
        var duration = interval * num;
        if (duration > 1.0)
            interval = 1.0 / num;

        var callback = function() {
            this.spawnGoldAnim(cc.ResourceMgr.icons["gold"], srcX, srcY, dstX, dstY);
            srcJinbi.string = parseInt(srcJinbi.string) - 1;
            dstJinbi.string = parseInt(dstJinbi.string) + 1;
        }
        this.schedule(callback, interval, num-1);
    },

    spawnGoldsAnimChairID: function(localChairID, bankerChairID, chairID, score) {
        var bankerChairIdx = this.getChairIdx(localChairID, bankerChairID);
        var chairIdx = this.getChairIdx(localChairID, chairID);

        var bankerPlayerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + bankerChairIdx, this.node);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);

        this.spawnGoldsAnim(bankerPlayerInfo, playerInfo, score);
    },

    clearAllGoldsAnims: function() {
        this.unscheduleAllCallbacks();
    },

    // 金币堆动画
    spawnGoldStackAnimIn: function(spriteFrame, srcX, srcY, dstX, dstY) {
        var prefabSprite = cc.ResourceMgr.prefab["PrefabSprite"];
        if (prefabSprite) {        
            srcX += (Math.random() * 2 - 1) * 20;
            srcY += (Math.random() * 2 - 1) * 20;
            dstX += (Math.random() * 2 - 1) * 50;
            dstY += (Math.random() * 2 - 1) * 20;

            var instanceSprite = cc.instantiate(prefabSprite);
            var sprite = instanceSprite.getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;

            instanceSprite.x = srcX;
            instanceSprite.y = srcY;
            instanceSprite.parent = this.node.getChildByName("jinbidui").getChildByName("stack");

            var seq = cc.sequence(
                cc.moveTo(0.5, dstX, dstY)
                );
            instanceSprite.runAction(seq);
        }
    },

    spawnGoldStackAnimOut: function(spriteFrame, srcX, srcY, dstX, dstY) {
        var prefabSprite = cc.ResourceMgr.prefab["PrefabSprite"];
        if (prefabSprite) {        
            srcX += (Math.random() * 2 - 1) * 50;
            srcY += (Math.random() * 2 - 1) * 20;
            dstX += (Math.random() * 2 - 1) * 20;
            dstY += (Math.random() * 2 - 1) * 20;

            var instanceSprite = cc.instantiate(prefabSprite);
            var sprite = instanceSprite.getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;

            instanceSprite.x = srcX;
            instanceSprite.y = srcY;
            instanceSprite.parent = this.node.getChildByName("jinbidui").getChildByName("stack");

            var seq = cc.sequence(
                cc.moveTo(0.5, dstX, dstY),
                cc.fadeOut(0)
                );
            instanceSprite.runAction(seq);
        }
    },

    spawnGoldsStackAnimIn: function(stackNode, playerNode, num) {
        var stackJinbi = stackNode.getChildByName("jinbi").getComponent(cc.Label);
        var playerJinbi = playerNode.getChildByName("jinbi").getComponent(cc.Label);

        var srcJinbi, dstJinbi;
        var srcX, srcY;
        var dstX, dstY;
        srcJinbi = playerJinbi;
        dstJinbi = stackJinbi;
        srcX = playerNode.x;
        srcY = playerNode.y;
        dstX = stackNode.x;
        dstY = stackNode.y;

        var interval = 0.1;
        var duration = interval * num;
        if (duration > 1.0)
            interval = 1.0 / num;

        var callback = function() {
            this.spawnGoldStackAnimIn(cc.ResourceMgr.icons["gold"], srcX, srcY, dstX, dstY);
            srcJinbi.string = parseInt(srcJinbi.string) - 1;
            dstJinbi.string = parseInt(dstJinbi.string) + 1;
        }
        this.schedule(callback, interval, num-1);
    },

    spawnGoldsStackAnimOut: function(stackNode, playerNode, num) {
        var stackJinbi = stackNode.getChildByName("jinbi").getComponent(cc.Label);
        var playerJinbi = playerNode.getChildByName("jinbi").getComponent(cc.Label);

        var srcJinbi, dstJinbi;
        var srcX, srcY;
        var dstX, dstY;
        dstJinbi = playerJinbi;
        srcJinbi = stackJinbi;
        dstX = playerNode.x;
        dstY = playerNode.y;
        srcX = stackNode.x;
        srcY = stackNode.y;

        var interval = 0.1;
        var duration = interval * num;
        if (duration > 1.0)
            interval = 1.0 / num;

        var callback = function() {
            this.spawnGoldStackAnimOut(cc.ResourceMgr.icons["gold"], srcX, srcY, dstX, dstY);
            var srcNum = parseInt(srcJinbi.string) - 1;
            // if (srcNum < 0) srcNum = 0;
            srcJinbi.string = srcNum;
            dstJinbi.string = parseInt(dstJinbi.string) + 1;

            var golds = stackNode.getChildByName("stack").getChildren();
            if (golds && golds[0] && golds[0].active)
                golds[0].removeFromParent(true);
        }
        this.schedule(callback, interval, num-1);
    },

    spawnGoldsStackAnimBetChairID: function(localChairID, chairID, num) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        playerInfo.goldsNum = num;

        var goldStack = cc.find("jinbidui", this.node);
        if (!goldStack.goldsNum) goldStack.goldsNum = 0;
        goldStack.active = true;

        if (num > 0) {
            goldStack.goldsNum += num;
            this.spawnGoldsStackAnimIn(goldStack, playerInfo, num);
        }
    },

    spawnGoldsStackAnimConcludeChairID: function(localChairID, chairID, num) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        if (playerInfo.goldsNum) num += playerInfo.goldsNum;

        var goldStack = cc.find("jinbidui", this.node);
        if (!goldStack.goldsNum) goldStack.goldsNum = 0;
        goldStack.goldsNum -= num;
        if (num > 0)
            this.spawnGoldsStackAnimOut(goldStack, playerInfo, num);
        else if (num < 0)
            this.spawnGoldsStackAnimIn(goldStack, playerInfo, Math.abs(num));
    },

    spawnGoldsStackPayback: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);

        var goldStack = cc.find("jinbidui", this.node);
        if (!goldStack.goldsNum) goldStack.goldsNum = 0;
        var num = goldStack.goldsNum;

        if (num > 0) {
            goldStack.goldsNum -= num;
            this.spawnGoldsStackAnimOut(goldStack, playerInfo, num);
        }
    },

    clearGoldsStack: function() {
        var goldStack = cc.find("jinbidui", this.node);
        goldStack.goldsNum = 0;
        goldStack.getChildByName("stack").removeAllChildren(true);
    },

    //-------------------------------------------------------------------------
    // 显示房间信息
    enableRoomInfo: function() {
        var roomInfo = cc.find("RoomInfo", this.node);
        roomInfo.active = true;
    },
    
    isRoomInfoEnabled: function() {
        var roomInfo = cc.find("RoomInfo", this.node);
        return roomInfo.active;
    },

    // 关闭房间信息
    disableRoomInfo: function() {
        var roomInfo = cc.find("RoomInfo", this.node);
        roomInfo.active = false;
    },

    // 设置房间信息
    setRoomInfo: function(roomInfo) {
        var node = cc.find("RoomInfo", this.node);

        var roomNum = node.getChildByName("roomNum").getComponent(cc.Label);
        var zhuangwei = node.getChildByName("zhuangwei").getComponent(cc.Label);
        var difen = node.getChildByName("difen").getComponent(cc.Label);
        var jushu = node.getChildByName("jushu").getComponent(cc.Label);

        roomNum.string = roomInfo.roomNum;
        zhuangwei.string = roomInfo.zhuangwei;
        jushu.string = roomInfo.jushu;
        difen.string = roomInfo.difen;
    },

    //-------------------------------------------------------------------------
    // 显示玩家信息
    enablePlayerInfo: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        playerInfo.active = true;
    },
    
    isPlayerInfoEnabled: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        return playerInfo.active;
    },

    // 关闭玩家信息
    disablePlayerInfo: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        playerInfo.active = false;

        // 隐藏加注图片
        var gold = cc.find("PlayerIcon/Gold" + chairIdx, this.node);
        gold.active = false;
    },
    
    // 设置玩家信息
    setPlayerInfo: function(localChairID, chairID, userInfo, userData) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);

        // 设置 userData, 个人信息面板中送礼物等按钮点击时需要访问对应玩家信息
        playerInfo.getComponent("PlayerInfo").userData = userData;
        
        // 显示玩家名字
        playerInfo.getChildByName("name").getComponent(cc.Label).string = userInfo.szNickName;

        // 初始分
        var jinbi = playerInfo.getChildByName("jinbi");
        jinbi.baseScore = userInfo.lScore;
        jinbi.getComponent(cc.Label).string = "0";
    },

    // 设置玩家信息
    setPlayerIndividual: function(localChairID, chairID, individualInfo) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);

        // 设置头像
        var icon = playerInfo.getChildByName("touxiang").getComponent(cc.Sprite); 
        if (individualInfo && individualInfo.szHeadHttp && individualInfo.szHeadHttp.length > 0) {
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
    },

    // 设置玩家金币
    setPlayerGold: function(localChairID, chairID, gold) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        
        var jinbi = playerInfo.getChildByName("jinbi").getComponent(cc.Label);
        jinbi.string = gold + "";
    },

    addPlayerGold: function(localChairID, chairID, gold) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + chairIdx, this.node);
        
        var jinbi = playerInfo.getChildByName("jinbi").getComponent(cc.Label);
        jinbi.string = (parseInt(jinbi.string) + gold) + "";
    },

    // 设置庄家图片
    setBanker: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        for (var i = 0; i < PLAYER_COUNT; ++i) {
            var playerInfo = cc.find("PlayerIcon/PrefabPlayerInfo" + i, this.node);
            var zhuang = playerInfo.getChildByName("zhuang");
            if (i == chairIdx)
                zhuang.active = true;
            else
                zhuang.active = false;
        }
    },

    // 显示加注金币图片
    enableAddScoreGold: function(localChairID, chairID, score) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var gold = cc.find("PlayerIcon/Gold" + chairIdx, this.node);
        var num = gold.getChildByName("num");
        num.getComponent(cc.Label).string = "x" + score;
        gold.active = true;
    },

    // 关闭加注金币图片
    disableAddScoreGold: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var gold = cc.find("PlayerIcon/Gold" + chairIdx, this.node);
        gold.active = false;
    },

    // 显示准备按钮
    enableReadyBtn: function() {
        cc.find("ZhunBei", this.node).active = true;
    },
    
    // 关闭准备按钮
    disableReadyBtn: function() {
        cc.find("ZhunBei", this.node).active = false;
        var jiesanstatus = cc.find("jiesanstatus",this.node);
        jiesanstatus.getChildByName("shenqingfail").active = false;
        jiesanstatus.active=false;
    },
    
    // 显示微信邀请按钮
    enableWXInviteBtn: function() {
        cc.find("WXInvateBtn", this.node).active = true;
    },
    
    // 关闭微信邀请按钮
    disableWXInviteBtn: function() {
        cc.find("WXInvateBtn", this.node).active = false;
    },
    
    // 显示下注按钮
    enableAddScoreBtn: function() {
        cc.find("XiaZhu", this.node).active = true;
    },
    
    // 关闭下注按钮
    disableAddScoreBtn: function() {
        cc.find("XiaZhu", this.node).active = false;
    },
    
    // 设置下注按钮
    setAddScoreBtn: function(number1, number2) {
        var xiazhu = cc.find("XiaZhu", this.node);

        // 第一个加注按钮
        var xiazhu1 = xiazhu.getChildByName("xiazhu1");
        xiazhu1.addScoreNumber1 = number1;

        var ofs = cc.find("ofs", xiazhu1);
        var shu1 = ofs.getChildByName("shu1");
        var shu2 = ofs.getChildByName("shu2");
        if (number1 < 10) {
            // 居中对齐
            ofs.x = 10;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.fenshuNumber[number1 + ""];
            shu2.getComponent(cc.Sprite).spriteFrame = null;
        }
        else {
            ofs.x = 0;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.fenshuNumber[Math.floor(number1 / 10) + ""];
            shu2.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.fenshuNumber[(number1 % 10) + ""];
        }
        
        // 第二个加注按钮
        var xiazhu2 = xiazhu.getChildByName("xiazhu2");
        xiazhu2.addScoreNumber2 = number2;

        ofs = cc.find("ofs", xiazhu2);
        shu1 = ofs.getChildByName("shu1");
        shu2 = ofs.getChildByName("shu2");
        if (number2 < 10) {
            // 居中对齐
            ofs.x = 10;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.fenshuNumber[number2 + ""];
            shu2.getComponent(cc.Sprite).spriteFrame = null;
        }
        else {
            ofs.x = 0;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.fenshuNumber[Math.floor(number2 / 10) + ""];
            shu2.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.fenshuNumber[(number2 % 10) + ""];
        }
    },

    // 显示提示按钮
    enableHelpBtn: function() {
        var playerCard = cc.find("PlayerIcon/Card0", this.node);
        var btn = playerCard.getChildByName("chakan");
        if (btn) btn.active = true;
    },
    
    // 关闭提示按钮
    disableHelpBtn: function() {
        var playerCard = cc.find("PlayerIcon/Card0", this.node);
        var btn = playerCard.getChildByName("chakan");
        if (btn) btn.active = false;
    },
    
    // 显示摊牌按钮
    enableOpenBtn: function() {
        var playerCard = cc.find("PlayerIcon/Card0", this.node);
        var btn = playerCard.getChildByName("bipai");
        if (btn) btn.active = true;
    },
    
    // 关闭摊牌按钮
    disableOpenBtn: function() {
        var playerCard = cc.find("PlayerIcon/Card0", this.node);
        var btn = playerCard.getChildByName("bipai");
        if (btn) btn.active = false;
    },

    //-------------------------------------------------------------------------
    // 显示一个位置的所有牌
    enableCards: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        playerCard.active = true;
    },
    
    isCardsEnabled: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        return playerCard.active;
    },

    // 关闭一个位置的所有牌
    disableCards: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        playerCard.active = false;
    },
    
    // 设置一个位置的某一张牌
    getCard: function(localChairID, chairID, cardIdx) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        var i = cardIdx;
        return playerCard.children[i].getComponent("Card").get();
    },

    setCard: function(localChairID, chairID, cardIdx, card) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        var i = cardIdx;
        var id = card;
        playerCard.children[i].getComponent("Card").set(id);
    },

    // 设置一个位置的所有牌
    setCards: function(localChairID, chairID, cards) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        for (var i = 0; i < cards.length; ++i) {
            var id = cards[i];
            playerCard.children[i].getComponent("Card").set(id);
        }
    },
    
    // 设置一个位置的某一张牌的牌面是否可见
    setCardVis: function(localChairID, chairID, cardIdx, vis) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        var i = cardIdx;
        playerCard.children[i].getComponent("Card").set(-1, vis);
    },

    // 设置一个位置的所有牌的牌面是否可见
    setCardsVis: function(localChairID, chairID, vis) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        for (var i = 0; i < CARD_COUNT; ++i)
            playerCard.children[i].getComponent("Card").set(-1, vis);
    },
    
    // 设置一个位置的某一张牌是否可点选
    setCardSelectable: function(localChairID, chairID, cardIdx, selectable) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        var i = cardIdx;
        playerCard.children[i].getComponent("Card").selectable = selectable;
    },

    // 设置一个位置的所有牌是否可点选
    setCardsSelectable: function(localChairID, chairID, selectable) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        for (var i = 0; i < CARD_COUNT; ++i)
            playerCard.children[i].getComponent("Card").selectable = selectable;
    },

    // 设置一个位置的某一张牌是否选中
    isCardSelected: function(localChairID, chairID, cardIdx) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var i = cardIdx;
        return playerCard.children[i].getComponent("Card").selected;
    },

    setCardSelect: function(localChairID, chairID, cardIdx, selected, force) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        var i = cardIdx;
        var selectable = playerCard.children[i].getComponent("Card").selectable;
        if (force) playerCard.children[i].getComponent("Card").selectable = true;
        playerCard.children[i].getComponent("Card").select(selected);
        playerCard.children[i].getComponent("Card").selectable = selectable;
    },

    // 设置一个位置的所有牌是否是否选中
    setCardsSelect: function(localChairID, chairID, selected, force) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);

        for (var i = 0; i < CARD_COUNT; ++i) {
            var selectable = playerCard.children[i].getComponent("Card").selectable;
            if (force) playerCard.children[i].getComponent("Card").selectable = true;
            playerCard.children[i].getComponent("Card").select(selected);
            playerCard.children[i].getComponent("Card").selectable = selectable;
        }
    },

    // 显示牌上完成图片
    enableCardFinish: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("wancheng");
        if (node) node.active = true;
    },

    // 关闭牌上完成图片
    disableCardFinish: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("wancheng");
        if (node) node.active = false;
    },

    // 显示牌上牛牛结果图片
    enableCardOx: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("jieguo");
        if (node) node.active = true;
    },

    // 关闭牌上牛牛结果图片
    disableCardOx: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("jieguo");
        if (node) node.active = false;
    },

    // 设置派上牛牛结果图片
    setCardOx: function(localChairID, chairID, ox) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("jieguo");
        
        if (ox == OX_VALUE0)
            node.getComponent(cc.Sprite).spriteFrame = null;
        else
            node.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.niuniuNumber["ding"];

        var number = "niu" + ox;
        var nodeniu = node.getChildByName("niu");
        nodeniu.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.niuniuNumber[number];
    },

    // 显示牌上得分图片
    enableCardScore: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        if (playerCard.active != true) {
            var nodes = playerCard.getChildren();
            for (var i = 0; i < nodes.length; ++i)
                nodes[i].active = false;
            playerCard.active = true;
        }
        var node = playerCard.getChildByName("defen");
        if (node) node.active = true;
    },

    // 关闭牌上得分图片
    disableCardScore: function(localChairID, chairID) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("defen");
        if (node) node.active = false;
    },

    // 设置牌上得分图片
    setCardScore: function(localChairID, chairID, score) {
        var chairIdx = this.getChairIdx(localChairID, chairID);
        var playerCard = cc.find("PlayerIcon/Card" + chairIdx, this.node);
        var node = playerCard.getChildByName("defen");
        var ofs = node.getChildByName("ofs");
        var fuhao = ofs.getChildByName("fuhao");
        var shu1 = ofs.getChildByName("shu1");
        var shu2 = ofs.getChildByName("shu2");
        var shu3 = ofs.getChildByName("shu3");

        // 本地玩家分数图片是另一套颜色的图片
        var str = chairIdx == 0 ? "-" : "";

        // 符号
        if (score > 0)
            fuhao.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi["+" + str];
        else
            fuhao.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi["-" + str];
        
        // 数字
        var abs = Math.abs(score);
        if (abs < 10) {
            // 居中对齐
            ofs.x = 20;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi[abs + str];
            shu2.getComponent(cc.Sprite).spriteFrame = null;
            shu3.getComponent(cc.Sprite).spriteFrame = null;
        }
        else if (abs < 100) {
            // 居中对齐
            ofs.x = 10;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi[Math.floor(abs/10) + str];
            shu2.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi[(abs%10) + str];
            shu3.getComponent(cc.Sprite).spriteFrame = null;
        }
        else {
            ofs.x = 0;
            shu1.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi[Math.floor(abs/100) + str];
            shu2.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi[Math.floor((abs%100)/10) + str];
            shu3.getComponent(cc.Sprite).spriteFrame = cc.ResourceMgr.shuzi[(abs%10) + str];
        }
    },

    //-------------------------------------------------------------------------
    // 显示结算信息
    enableFinalInfo: function() {
        var jiesuan = cc.find("JieSuan", this.node);
        jiesuan.active = true;
    },
    
    isFinalInfoEnabled: function() {
        var jiesuan = cc.find("JieSuan", this.node);
        return jiesuan.active;
    },

    // 关闭结算信息
    disableFinalInfo: function() {
        var jiesuan = cc.find("JieSuan", this.node);
        jiesuan.active = false;
    },

    // 设置结算信息
    setFinalInfo: function(finalInfo) {
        var jiesuan = cc.find("JieSuan", this.node);
        var content = cc.find("dakuang/content", jiesuan);
        var cnt = 0;

        for (var i = 0; i < PLAYER_COUNT; ++i) {
            var prefab = cc.find("PrefabJieSuan" + i, content);
            prefab.active = false;
            
            var info = finalInfo[i];
            if (info) {
                var player = cc.PlayerMgr.getPlayerByChairID(i);
                if (player) {
                    var ui = cc.find("fangkuang", prefab);
                    var icon = cc.find("touxiang/touxiang", ui).getComponent(cc.Sprite);
                    var name = cc.find("touxiang/name", ui).getComponent(cc.Label);
                    var id = cc.find("touxiang/id", ui).getComponent(cc.Label);
                    var danjuzuigao = cc.find("danjuzuigao/txt/num", ui).getComponent(cc.Label);
                    var danjuzuida = cc.find("danjuzuida/txt/num", ui).getComponent(cc.Label);
                    var shenglijushu = cc.find("shenglijushu/txt/num", ui).getComponent(cc.Label);
                    var shibaijushu = cc.find("shibaijushu/txt/num", ui).getComponent(cc.Label);
                    var zongchengji = cc.find("zongchengji/num", ui).getComponent(cc.Label);

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
                    
                    name.string = player.userInfo.szNickName;
                    id.string = player.userInfo.dwUserID;
                    danjuzuigao.string = info.lSingleHightScore;
                    danjuzuida.string = info.lSingleHightOxCard;
                    shenglijushu.string = info.lWinNum;
                    shibaijushu.string = info.lloseNum;
                    zongchengji.string = info.lAllScore;

                    ++cnt;
                    prefab.active = true;
                }
            }
        }

        if (cnt < 6) {
            if (!content.org) content.org = content.x;
            var org = content.org;
            var w = content.width / 6;
            content.x = org + w * (6 - cnt) / 2;
        }
    },
});
