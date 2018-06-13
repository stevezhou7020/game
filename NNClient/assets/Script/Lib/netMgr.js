
// 网络管理器
//      中间层: 位于底层通信与上层UI之间(底层代码不能直接与上层UI代码耦合)
//      底层通信 -> NetMgr -> Cocos/App

var g_netMgr = null;
var NetMgr = cc.Class({
    properties: {
        // 准备连接一次
        connectTryOnce: {
            default: false,
            visible: false,
        },
        // 重连最小间隔
        connectCooldown: {
            default: 0.0,
            visible: false,
        },
        // 需要自动连接游戏服
        needConnectGame: {
            default: false,
            visible: false,
        },
    },

    update: function (dt) {
        if (cc.NetMgr.connectTryOnce) {
            cc.NetMgr.connectCooldown -= dt;
            if (cc.NetMgr.connectCooldown <= 0)
            {
                cc.NetMgr.connectTryOnce = false;
                cc.NetMgr.connectCooldown = 0.5;
                cc.LogonMsgHandler.connect(cc.LogonIp, cc.LogonPort);
            }
        }
    },

	//---------------------------------------------------------------------------------
    // Logon 连接
    connect: function(delay) {
        cc.PlayerMgr.localPlayerId = 0;
        cc.PlayerMgr.players = {};
        cc.ServerListMsg.ServerList = {};
        cc.LogonMsgHandler.close();

        cc.NetMgr.needConnectGame = true;
        cc.NetMgr.connectCooldown = delay ? delay : 0.0;
        cc.NetMgr.connectTryOnce = true;
    },

	//---------------------------------------------------------------------------------
    // Logon 连接结果
    onLogonConnectResult: function(bSuccess) { 
        // 断线即重连
        if (!bSuccess) {
            cc.NetMgr.connect(0.5);
        }
        // 连接成功，开始登录
        else {
            cc.LoginInfo = JSON.parse(cc.LocalStorageMgr.getLoginRecordItem());
           if (!cc.LoginInfo.Account || !cc.LoginInfo.Password) {
                if (cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) {
                    // 微信
                    var agent = anysdk.agentManager;
                    var userPlugin = agent.getUserPlugin();
                    userPlugin.removeListener();
                    userPlugin.setListener(this.onWXLogon, this);
                    userPlugin.login();
                }
                else {
                    // 测试用账号
                    var date = Date.now().toString();
                    date = date.substr(date.length - 6, 6);
                    cc.LoginInfo = {
                        "Account": "WX" + date,
                        "Password": "WeiXinPassword",
                        "NickName": encodeURI("昵称" + date),
                        "Gender": Math.random() < 0.5 ? 1 : 2,
                        "HeadUrl": ""
                    };
                    cc.LoginRegisterMsg.sendLogon(cc.LoginInfo.Account, cc.LoginInfo.Password);
                }
            }
            else {
                cc.LoginRegisterMsg.sendLogon(cc.LoginInfo.Account, cc.LoginInfo.Password);
            }
        }
    },

    // 微信登录
    onWXLogon: function (code, msg) {
        var agent = anysdk.agentManager;
        var userPlugin = agent.getUserPlugin();
        switch(code) {
            case anysdk.UserActionResultCode.kLoginSuccess:
                var info = JSON.parse(userPlugin.getUserInfo().toString());
                cc.LoginInfo = {
                    "Account": "WX_" + info.uid,
                    "Password": "WeiXinPassword",
                    "NickName": encodeURI(info.nickname),
                    "Gender": info.sex,
                    "HeadUrl": info.avatarUrl + ".jpg"
                };
                cc.LoginRegisterMsg.sendLogon(cc.LoginInfo.Account, cc.LoginInfo.Password);
                break;
            case anysdk.UserActionResultCode.kLoginNetworkError:
            case anysdk.UserActionResultCode.kLoginCancel:
            case anysdk.UserActionResultCode.kLoginFail:
                break;
        }
    },

    // 登录结果
    onLogonLogonResult: function(bSuccess, data) {
        // 登录失败
        if (bSuccess == false) {         
            // 如果没有注册, 自动注册
            if (data.lResultCode == 3 || data.lResultCode == 1) {
                cc.LoginRegisterMsg.sendRegister(cc.LoginInfo.Account, cc.LoginInfo.Password, cc.LoginInfo.NickName, cc.LoginInfo.Gender);
            }
            // 其它错误则自动重连
            else {
                cc.NetMgr.connect(0.5);
            }
        }
        // 登录成功
        else {
            // 更新头像 url
            if (cc.LoginInfo.HeadUrl && cc.LoginInfo.HeadUrl.length > 0)
                cc.UserServiceMsg.sendModifyIndividual(data.dwUserID, cc.LoginInfo.Password, cc.LoginInfo.Gender, cc.LoginInfo.HeadUrl, DTP_GP_UI_HEAD_HTTP)
            cc.LocalStorageMgr.setLoginRecordItem(JSON.stringify(cc.LoginInfo));
        }
    },

    // 登录完成
    onLogonLogonFinish: function(data) {
        // 请求帐号信息和个人信息
        cc.UserServiceMsg.sendQueryAccountInfo(cc.PlayerMgr.getLocalPlayerId());
        cc.UserServiceMsg.sendQueryIndividual(cc.PlayerMgr.getLocalPlayerId());
    },

    // 查询公告信息完成
    onLogonQueryPublicNoticeResult: function(data) {
        if (cc.Home && cc.Home.node && cc.Home.node.active) {
            cc.Home.onQueryPublicNoticeResult(data.szDescribeString);
        }
    },

    // 查询信息完成
    onLogonQueryInfoResult: function(player) {
        // 主界面更新玩家信息
        if (cc.Home && cc.Home.node && cc.Home.node.active) {
            cc.Home.onUpdatePlayerInfo(player);
        }

        // 房间内更新玩家信息
        if (cc.Room && cc.Room.node && cc.Room.node.active) {
            cc.Room.onUpdatePlayerInfo(player);
        }

        // 房间回放内更新玩家信息
        if (cc.RoomPlayback && cc.RoomPlayback.node && cc.RoomPlayback.node.active) {
            cc.RoomPlayback.onUpdatePlayerInfo(player);
        }

        // 连接游戏服
        if (cc.NetMgr.needConnectGame == true) {
            var localPlayer = cc.PlayerMgr.getPlayer(0);
            if (localPlayer && localPlayer.accountInfo && localPlayer.individualInfo && player.accountInfo && localPlayer.accountInfo.dwUserID == player.accountInfo.dwUserID) {
                cc.NetMgr.needConnectGame = false;
                cc.NetMgr.connectGame();
            }
        }
    },
    
    // 查询游戏记录列表完成
    onLogonQueryGameRecordListResult: function(TotalRecordList) {
        if (cc.Home && cc.Home.node && cc.Home.node.active) {
            cc.Home.onQueryGameRecordListResult(TotalRecordList);
        }
    },

    onLogonQueryGameRecordTotalResult: function(TotalRecord) {
        if (cc.ZhanJiItem && cc.ZhanJiItem.node && cc.ZhanJiItem.node.active) {
            cc.ZhanJiItem.onQueryGameRecordTotalResult(TotalRecord);
        }
    },

	//---------------------------------------------------------------------------------
    // Game 连接
    connectGame: function() {
        cc.GameMsgHandler.close();

        // 连接游戏服前先清理掉本地玩家的房间内信息
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer)
            localPlayer.userInfo = null;

        // 查询已在游戏服
        if (localPlayer && localPlayer.accountInfo && localPlayer.individualInfo) {
            cc.UserServiceMsg.sendQueryIngameServerId(localPlayer.accountInfo.dwUserID);
        }
        else
            cc.NetMgr.connect(0.5);
    },

    // 查询已在游戏服完成
    onGameQueryIngameServerIdResult: function(player) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer && localPlayer.accountInfo && localPlayer.individualInfo
        && player.accountInfo && localPlayer.accountInfo.dwUserID == player.accountInfo.dwUserID) {
            // 连接游戏服
            cc.GameMsgHandler.connect();
        }
    },
    
	//---------------------------------------------------------------------------------
    // Game 连接结果
    onGameConnectResult: function(bSuccess) { 
        // 断线即重连
        if (!bSuccess) {
            // 连接游戏服
            cc.NetMgr.connectGame();
        }
        // 连接成功，开始登录
        else {
            if (cc.LoginInfo.Password) {
                var localPlayer = cc.PlayerMgr.getPlayer(0);
                if (localPlayer && localPlayer.accountInfo && localPlayer.accountInfo.dwUserID)
                    cc.GameLogonMsg.sendLogon(localPlayer.accountInfo.dwUserID, cc.LoginInfo.Password);
            }
        }
    },
    
    // 登录结果
    onGameLogonResult: function(bSuccess, data) {
        // 登录失败
        if (bSuccess == false) {
            // 出错则自动重连
            cc.NetMgr.connectGame();
        }
        // 登录成功
        else {
        }
    },

    // 登录完成
    onGameLogonFinish: function() {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer) {
            // 之前已经在游戏房间中则重新进入房间
            if (localPlayer.userInfo && localPlayer.userInfo.wTableID != INVALID_TABLE) {
                cc.log("登录完成[onGameLogonFinish][本地玩家掉线后再次进入房间]");
                cc.director.loadScene("Room");
                cc.GameFrameMsg.sendGameOption();
            }
            // 否则进入主界面
            else {
                cc.director.loadScene("Home");
            }
            // 坐下
           //  cc.GameUserMsg.sendUserSitDown(localPlayer.userInfo.wTableID, localPlayer.userInfo.wChairID, "");
        }
    },

    // 用户进入
    onGameUserEnter: function(player) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        if (!localUserInfo || localUserInfo.wTableID == INVALID_TABLE)
            return;

		// 只处理本桌玩家
        var userInfo = player.userInfo;
        if (localUserInfo.wTableID != userInfo.wTableID)
            return;

        // 请求帐号信息和个人信息
        if (!player.accountInfo || !player.accountInfo.dwUserID)
            cc.UserServiceMsg.sendQueryAccountInfo(userInfo.dwUserID);
        if (!player.individualInfo || !player.individualInfo.dwUserID)
            cc.UserServiceMsg.sendQueryIndividual(userInfo.dwUserID);

        // 房间内玩家进入
        if (cc.Room && cc.Room.node && cc.Room.node.active) {
            cc.Room.onUpdatePlayerEnter(player);
        }
    },

    // 用户分数改变
    onGameUserScore: function(player) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        if (!localUserInfo || localUserInfo.wTableID == INVALID_TABLE)
            return;

		// 只处理本桌玩家
        var userInfo = player.userInfo;
        if (localUserInfo.wTableID != userInfo.wTableID)
            return;

        // 房间内更新玩家分数
        if (cc.Room && cc.Room.node && cc.Room.node.active) {
            cc.Room.onUpdatePlayerScore(player);
        }
    },

    // 用户状态改变
    onGameUserStatus: function(player, prevStatus, prevTableID, prevChairID) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        if (!localUserInfo)
            return;

        // 本地玩家
        var userInfo = player.userInfo;
        if (localUserInfo.dwUserID == userInfo.dwUserID) {
            if (prevTableID != localUserInfo.wTableID) {
                // 进入房间
                if (localUserInfo.wTableID != INVALID_TABLE) {
                    cc.log("用户状态改变[onGameUserStatus][本地玩家进入房间]");
                    cc.director.loadScene("Room");
                    cc.GameFrameMsg.sendGameOption();
                }
                // 离开房间
                else {
                    cc.log("用户状态改变[onGameUserStatus][本地玩家离开房间]");
                    if (cc.Room && cc.Room.node && cc.Room.node.active) {
                        cc.Room.onUpdatePlayerLeave(localPlayer, prevChairID);
                    }
                }
            }
            return;
        }

		// 只处理本桌玩家
        if (prevTableID != localUserInfo.wTableID)
            return;

        // 玩家离开房间
        if (userInfo.wTableID == INVALID_TABLE && prevTableID != INVALID_TABLE) {
            if (cc.Room && cc.Room.node && cc.Room.node.active) {
                cc.Room.onUpdatePlayerLeave(player, prevChairID);
            }
        }

        // 房间内更新玩家状态
        if (cc.Room && cc.Room.node && cc.Room.node.active) {
            cc.Room.onUpdatePlayerStatus(player, prevStatus);
        }
    },

    // 用户表情消息
    onGameUserExpression: function(exprId, senderPlayer, targetPlayer) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        var localUserInfo = localPlayer.userInfo;
        if (!localUserInfo || localUserInfo.wTableID == INVALID_TABLE)
            return;

		// 只处理本桌玩家
        var senderUserInfo = senderPlayer.userInfo;
        var targetUserInfo = targetPlayer ? targetPlayer.userInfo : null;
        if (localUserInfo.wTableID != senderUserInfo.wTableID || (targetUserInfo && localUserInfo.wTableID != targetUserInfo.wTableID))
            return;

        // 房间内更新用户聊天表情
        if (cc.RoomChat && cc.RoomChat.node && cc.RoomChat.node.active) {
            cc.RoomChat.onPlayerExpression(exprId, senderPlayer, targetPlayer);
        }
    },

    // 同桌语聊
    onTableTalk: function(data) {
        // 房间内更新同桌语聊
        if (cc.RoomChat && cc.RoomChat.node && cc.RoomChat.node.active) {
            cc.RoomChat.onTableTalk(data);
        }
    },

	//---------------------------------------------------------------------------------
    // 私人场创建成功
    onGameCreatePrivateSucess: function(data) {
    },

    // 私人场信息
    onGamePrivateInfo: function(data) {

    },

    // 私人场房间信息
    onGamePrivateRoomInfo: function(data) {
        cc.RoomInfo = data;
        
        // 更新房间信息
        if (cc.Room && cc.Room.node && cc.Room.node.active) {
            cc.Room.onUpdateRoom(data);
        }

        // 自动准备
        /*var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (localPlayer && localPlayer.userInfo && localPlayer.userInfo.wTableID != INVALID_TABLE && localPlayer.userInfo.wChairID != INVALID_CHAIR) {
            cc.GameFrameMsg.sendUserReady(localPlayer.userInfo.dwUserID, localPlayer.userInfo.wTableID, localPlayer.userInfo.wChairID);
        }*/
    },

    // 私人场结算
    onGamePrivateEnd: function(data) {
        // 通知房间结算
        if (cc.Room && cc.Room.node && cc.Room.node.active) {
            cc.Room.onEndRoom(data);
        }
    },

    //申请解散房间失败
    onSubPrivateDismissFail:function(data){
        cc.Room.onShowApplyDismissRoomFail(data);
    },

    onSubPrivateDismissREQUIRE:function(data,status){
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (!localPlayer || !localPlayer.userInfo)
            return;

       if(status == 1)
            cc.Room.onShowApplyDismissRoom(data);
     
    },

    // 私人场解散
    onSubPrivateDismiss: function(data,status) {
        var localPlayer = cc.PlayerMgr.getPlayer(0);
        if (!localPlayer || !localPlayer.userInfo)
            return;

        if(status == 1)
            cc.Room.onShowApplyDismissRoom(data);
        else
            cc.GamePrivateMsg.sendDismissPrivate(1);
    },

    // 私人场房间列表
    onGamePrivateRoomList: function(data) {
        if (cc.Home && cc.Home.node && cc.Home.node.active) {
            cc.Home.onRoomList(data);
        }
    },
});

NetMgr.getInstance = function(){
	if(g_netMgr == null){
		g_netMgr = new NetMgr();
	}
	return g_netMgr;
}
module.exports = NetMgr;