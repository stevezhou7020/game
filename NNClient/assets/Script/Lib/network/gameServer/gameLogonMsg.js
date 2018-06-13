
var g_gameLogonMsg = null;
var GameLogonMsg = cc.Class({
	ctor: function(){},
	
	//---------------------------------------------------------------------------------
	// 发送登录游戏服
	sendLogon: function(dwUserID, szPassword){
		var machineId = cc.LocalStorageMgr.getUuidItem();

		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128);
		dataBuilder.build([
			//版本信息
			["dwPlazaVersion", "DWORD", VERSION_PLAZA],									//游戏标识
			["dwFrameVersion", "DWORD", VERSION_FRAME],									//框架版本
			["dwProcessVersion", "DWORD", VERSION_FRAME],								//进程版本
			//登录信息
			["dwUserID", "DWORD", dwUserID],											//用户 I D
			["szPassword", "CHARS", szPassword, LEN_PASSWORD],							//登录密码
			["szMachineID", "CHARS", machineId, LEN_MACHINE_ID],						//机器序列
			["wKindID", "WORD", GAME_KIND_ID],											//类型索引
			]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 登录游戏服[sendLogon]");
			cc.GameSocket.sendData(MDM_GR_LOGON, SUB_GR_LOGON_USERID, dataBuilder.getData());
		}
	},	

	//---------------------------------------------------------------------------------
	// 响应登录命令
	onMainLogon: function(subCmd, data){
		switch (subCmd) {
		//登录成功
		case SUB_GR_LOGON_SUCCESS:
			cc.GameLogonMsg.onSubLogonSuccess(data);
			break;
		//登录失败
		case SUB_GR_LOGON_FAILURE:
			cc.GameLogonMsg.onSubLogonFailure(data);
			break;
		//登录完成
		case SUB_GR_LOGON_FINISH:
			cc.GameLogonMsg.onSubLogonFinish(data);
			break;
		//升级提示
		case SUB_GR_UPDATE_NOTIFY:
			cc.GameLogonMsg.onSubUpdateNotify(data);
			break;
		default:
			break;
		}
	},

	// 登录成功
	onSubLogonSuccess: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["dwUserRight", "DWORD"],													//用户权限
			["dwMasterRight", "DWORD"],  												//管理权限
			]);

		cc.log("游戏服:登录成功[onSubLogonSuccess]:" + JSON.stringify(parseData));
		cc.NetMgr.onGameLogonResult(true, parseData);
	},

	// 登录失败
	onSubLogonFailure: function(data) {	
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lErrorCode", "DWORD"],													//错误代码
			["szDescribeString", "CHARS", 128],  										//描述消息
			]);

		cc.log("游戏服:登录失败[onSubLogonFailure]:" + JSON.stringify(parseData));
		cc.NetMgr.onGameLogonResult(false, parseData);
	},

	// 登录完成
	onSubLogonFinish: function(data){
		cc.log("游戏服:登录完成[onSubLogonFinish]");
		cc.NetMgr.onGameLogonFinish();
	},
	
	// 升级提示
	onSubUpdateNotify: function(data) {	
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//升级标志
			["cbMustUpdatePlaza", "BYTE"],												//强行升级
			["cbMustUpdateClient", "BYTE"],												//强行升级
			["cbAdviceUpdateClient", "BYTE"],											//建议升级
			//当前版本
			["dwCurrentPlazaVersion", "DWORD"],											//当前版本
			["dwCurrentFrameVersion", "DWORD"],											//当前版本
			["dwCurrentClientVersion", "DWORD"],										//当前版本
			["szDownLoadHttp", "CHARS", 128],  											//描述消息
			]);

		cc.log("游戏服:升级提示[onSubUpdateNotify]:" + JSON.stringify(parseData));
	},
});

GameLogonMsg.getInstance = function(){
	if(g_gameLogonMsg == null){
		g_gameLogonMsg = new GameLogonMsg();
	}
	return g_gameLogonMsg;
}
module.exports = GameLogonMsg;