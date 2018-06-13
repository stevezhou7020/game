
var g_gameMsgHandler = null;
var GameMsgHandler = cc.Class({
	ctor: function(){},
	
	//---------------------------------------------------------------------------------
	// 连接
	connect: function () {
		if (cc.GameSocket.status != SOCKET_STATUS.SS_INVALID) {
			cc.GameMsgHandler.onConnectResult(true);
		} else {
			var server = cc.ServerListMsg.getServer(GAME_KIND_ID);
			if (server && server.ip && server.port)
				cc.MsgMgr.connectGameServer(server.ip, server.port);
		}
	},

	// 关闭
	close: function () {
		cc.GameSocket.close();
	},

	//---------------------------------------------------------------------------------
	// 响应连接
	onConnectResult: function (bResult) {
		cc.NetMgr.onGameConnectResult(bResult);
	},

	// 断线
	onOffLine: function () {
		cc.GameMsgHandler.close();
		cc.GameMsgHandler.onConnectResult(false);
	},

	// 消息
	onMessage: function(msg){
		var mainCmd = msg.mainCmd;
		var subCmd = msg.subCmd;
		var data = msg.data;

		switch (mainCmd) {
			//登录命令
			case MDM_GR_LOGON:
				cc.GameLogonMsg.onMainLogon(subCmd, data);
				break;
			//配置命令
			case MDM_GR_CONFIG:
				cc.GameConfigMsg.onMainConfig(subCmd, data);
				break;
			//用户命令
			case MDM_GR_USER:
				cc.GameUserMsg.onMainUser(subCmd, data);
				break;
			//框架命令
			case MDM_GF_FRAME:
				cc.GameFrameMsg.onMainGameFrame(subCmd, data);
				break;
			case MDM_CM_SYSTEM:					
				if (subCmd == SUB_CM_SYSTEM_MESSAGE) {
					cc.GameFrameMsg.onMainGameFrame(SUB_GF_SYSTEM_MESSAGE, data);
				}
			break;
			//私人场命令
			case MDM_GR_PRIVATE:
				cc.GamePrivateMsg.onMainPrivate(subCmd, data);
				break;
			//游戏命令
			case MDM_GF_GAME:
				cc.GameMgr.onGameMsg(subCmd, data);
				break;
			default:
				break;
		}
	},
});

GameMsgHandler.getInstance = function(){
	if(g_gameMsgHandler == null){
		g_gameMsgHandler = new GameMsgHandler();
	}
	return g_gameMsgHandler;
}
module.exports = GameMsgHandler;
