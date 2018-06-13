
var g_logonMsgHandler = null;
var LogonMsgHandler = cc.Class({
	ctor: function () {},

	//---------------------------------------------------------------------------------
	// 连接
	connect: function () {
		if (cc.LogonSocket.status != SOCKET_STATUS.SS_INVALID) {
			cc.LogonMsgHandler.onConnectResult(true);
		} else {
			cc.MsgMgr.connectLogonServer(cc.LogonIp, cc.LogonPort);
		}
	},

	// 关闭
	close: function () {
		cc.LogonSocket.close();
	},
	
	//---------------------------------------------------------------------------------
	// 响应连接
	onConnectResult: function (bResult) {
		cc.NetMgr.onLogonConnectResult(bResult);
	},

	// 断线
	onOffLine: function () {
		cc.LogonMsgHandler.close();
		cc.LogonMsgHandler.onConnectResult(false);
	},

	// 消息
	onMessage: function (msg) {
		var mainCmd = msg.mainCmd;
		var subCmd = msg.subCmd;
		var data = msg.data;

		switch (mainCmd) {
			//登录	
			case MDM_GP_LOGON:
				cc.LoginRegisterMsg.onMainLogon(subCmd, data);
				break;
			//列表命令	
			case MDM_GP_SERVER_LIST:
				cc.ServerListMsg.onMainServerList(subCmd, data);
				break;
			//用户服务命令	
			case MDM_GP_USER_SERVICE:
				cc.UserServiceMsg.onMainUserService(subCmd, data);
				break;
			default:
				break;
		}
	},
});

LogonMsgHandler.getInstance = function () {
	if (g_logonMsgHandler == null) {
		g_logonMsgHandler = new LogonMsgHandler();
	}
	return g_logonMsgHandler;
}
module.exports = LogonMsgHandler;