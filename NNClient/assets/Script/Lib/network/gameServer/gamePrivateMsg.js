
var g_gamePrivateMsg = null;
var GamePrivateMsg = cc.Class({
	ctor: function(){},

	//---------------------------------------------------------------------------------
	// 发送创建私人场消息
	sendCreatePrivate: function(cbGameType, cbPlayCout, dwGameRule) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128);
		dataBuilder.build([
			["cbGameType", "BYTE", cbGameType],											//游戏类型
			["cbPlayCoutIdex", "BYTE", cbPlayCout],										//游戏局数
			["cbGameTypeIdex", "BYTE", 0],												//游戏类型
			["dwGameRuleIdex", "DWORD", dwGameRule],									//游戏规则
			["szHttpChannel", "CHARS", "", LEN_NICKNAME],								//http获取
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 创建私人场[sendCreatePrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_CREATE_PRIVATE, dataBuilder.getData());
		}
	},
	
	// 加入私人场
	sendJoinPrivate: function(dwRoomNum) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([
			["dwRoomNum", "DWORD", dwRoomNum],											//房间ID
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 加入私人场[sendJoinPrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_JOIN_PRIVATE, dataBuilder.getData());
		}
	},
	
	// 私人场坐下
	sendSitDownPrivate: function(dwRoomNum) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([
			["dwRoomNum", "DWORD", dwRoomNum],											//房间ID
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 私人场坐下[sendSitDownPrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_SITDOWN_PRIVATE, dataBuilder.getData());
		}
	},
	//发送申请解散房间
	sendAcquireDismissroom: function(dwuserID,dismiss) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(8);
		dataBuilder.build([
			["dWuserID", "DWORD", dwuserID],												//解散
			["bDismiss", "BYTE", dismiss],
		]);
		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 申请解散私人场[sendDismissPrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_PRIVATE_DISMISS_REQUIRE, dataBuilder.getData());
		}
	},
	//离开但保存房间
	sendSaveAndLeavePrivate: function(bDismiss) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([]);
		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 解散私人场[sendDismissPrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_EXIT_SAVE, dataBuilder.getData());
		}
	},
	// 解散私人场
	sendDismissPrivate: function(bDismiss) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(1);
		dataBuilder.build([
			["bDismiss", "BYTE", bDismiss],												//解散
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 解散私人场[sendDismissPrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_PRIVATE_DISMISS, dataBuilder.getData());
		}
	},
	// 私人场房间列表
	sendQueryRoomListPrivate: function() {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(1);
		dataBuilder.build([
			["space_holder", "BYTE", 0],
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 请求私人场房间列表[sendQueryRoomListPrivate]");
			cc.GameSocket.sendData(MDM_GR_PRIVATE, SUB_GR_PRIVATE_ROOMLISTBYCREATOR, dataBuilder.getData());
		}
	},
	
	//---------------------------------------------------------------------------------
	// 响应私人场命令
	onMainPrivate: function(subCmd, data) {
		switch (subCmd) {
			//创建私人场成功
			case SUB_GR_CREATE_PRIVATE_SUCESS:
				cc.GamePrivateMsg.onSubCreatePrivateSucess(data);
				break;								
			//私人场信息
			case SUB_GR_PRIVATE_INFO:
				cc.GamePrivateMsg.onSubPrivateInfo(data);
				break;								
			//私人场房间信息
			case SUB_GF_PRIVATE_ROOM_INFO:
				cc.GamePrivateMsg.onSubPrivateRoomInfo(data);
				break;							
			//私人场结算
			case SUB_GF_PRIVATE_END:
				cc.GamePrivateMsg.onSubPrivateEnd(data);
				break;						
			//私人场解散
			case SUB_GR_PRIVATE_DISMISS:
				cc.GamePrivateMsg.onSubPrivateDismiss(data);
				break;
			case SUB_GR_PRIVATE_DISMISS_REQUIRE:
				cc.GamePrivateMsg.onSubPrivateDismissREQUIRE(data);
				break;
			//私人场请求解散 失败
			case SUB_GR_PRIVATE_DISMISS_FAIL:
				cc.GamePrivateMsg.onSubPrivateDismissFail(data);
				break;
			//私人场房间列表
			case SUB_GR_PRIVATE_ROOMLISTBYCREATOR:
				cc.GamePrivateMsg.onSubPrivateRoomList(data);
			default:
				break;
		}
	},

	// 创建私人场成功
	onSubCreatePrivateSucess: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lCurSocre", "SCORE"],														//当前剩余
			["dwRoomNum", "DWORD"],														//房间ID
		]);
		
		cc.log("创建私人场成功[onSubCreatePrivateSucess]:" + JSON.stringify(parseData));
		cc.NetMgr.onGameCreatePrivateSucess(parseData);
	},
	
	// 私人场信息
	onSubPrivateInfo: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wKindID", "WORD"],
			["lCostGold", "SCORE"],
			["bPlayCout", "BYTE[]", 4],													//玩家局数
			["lPlayCost", "SCORE[]", 4],												//消耗点数
		]);
		
		cc.log("私人场信息[onSubPrivateInfo]:" + JSON.stringify(parseData));
		cc.NetMgr.onGamePrivateInfo(parseData);
	},
	
	// 私人场房间信息
	onSubPrivateRoomInfo: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["bPlayCoutIdex", "BYTE"],													//玩家局数
			["bGameTypeIdex", "BYTE"],													//游戏类型
			["bGameRuleIdex", "DWORD"],													//游戏规则
			["bRoomCostType", "BYTE"],													//房卡扣费类型AA 房主扣
			["bStartGame", "BYTE"],
			["dwPlayCout", "DWORD"],													//游戏局数
			["dwRoomNum", "DWORD"],
			["dwCreateUserID", "DWORD"],
			["dwPlayTotal", "DWORD"],													//总局数
			]);
		
		cc.log("私人场房间信息[onSubPrivateRoomInfo]:" + JSON.stringify(parseData));
		cc.NetMgr.onGamePrivateRoomInfo(parseData);
	},
	
	// 私人场结算
	onSubPrivateEnd: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		
		var parseData = [];
		parseData.dwSize = dataParser.readDWord();
		for (var i = 0; i < parseData.dwSize; ++i) {
			parseData[i] = dataParser.parse([
				["lSingleHightScore", "INT"],											//单局最高分
				["lSingleHightOxCard", "BYTE"],											//单局最大牌型
				["lWinNum", "INT"],														//胜利局数
				["lloseNum", "INT"],													//失败局数
				["lAllScore", "INT"],													//总分数
			]);
		}
		
		cc.log("私人场结算[onSubPrivateEnd]:" + JSON.stringify(parseData));
		cc.NetMgr.onGamePrivateEnd(parseData);
	},

	onSubPrivateDismissREQUIRE:function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//用户属性
			["dwDissUserCout", "DWORD"],
			["dwDissChairID", "DWORD[]", 99],
			["dwValue1", "DWORD"],
			["dwNotAgreeUserCout", "DWORD"],
			["dwNotAgreeChairID", "DWORD[]", 99],
			["dwValue2", "DWORD"],
			["dwUserID", "DWORD"],
		]);

		cc.log("私人场请求解散[onSubPrivateDismiss]:" + JSON.stringify(parseData));
		cc.NetMgr.onSubPrivateDismissREQUIRE(parseData,1);
	},

	// 私人场请求解散
	onSubPrivateDismiss: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//用户属性
			["dwDissUserCout", "DWORD"],
			["dwDissChairID", "DWORD[]", 99],
			["dwValue1", "DWORD"],
			["dwNotAgreeUserCout", "DWORD"],
			["dwNotAgreeChairID", "DWORD[]", 99],
			["dwValue2", "DWORD"],
			["dwUserID", "DWORD"],
		]);
		
		cc.log("私人场请求解散[onSubPrivateDismiss]:" + JSON.stringify(parseData));
		cc.NetMgr.onSubPrivateDismiss(parseData ,0);
	},

	// 私人场请求解散 请求失败
	onSubPrivateDismissFail: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//用户属性
			["dwDissUserCout", "DWORD"],
			["dwDissChairID", "DWORD[]", 99],
			["dwValue1", "DWORD"],
			["dwNotAgreeUserCout", "DWORD"],
			["dwNotAgreeChairID", "DWORD[]", 99],
			["dwValue2", "DWORD"],
			["dwUserID", "DWORD"],
		]);
		cc.log("私人场请求解散请求失败[onSubPrivateDismiss]:" + JSON.stringify(parseData));
		cc.NetMgr.onSubPrivateDismissFail(parseData);
	},
	
	// 私人场房间列表
	onSubPrivateRoomList: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["dwRoomNum", "DWORD[]", 20],
			["roomType", "BYTE[]", 20],
			["difen", "BYTE[]", 20],
			["jushu", "BYTE[]", 20],
			["playerMax", "BYTE[]", 20],
			["playerJoinNum", "BYTE[]", 20],
		]);
		cc.log("私人场房间列表[onSubPrivateRoomList]:" + JSON.stringify(parseData));
		cc.NetMgr.onGamePrivateRoomList(parseData);
	},
});

GamePrivateMsg.getInstance = function() {
	if(g_gamePrivateMsg == null){
		g_gamePrivateMsg = new GamePrivateMsg();
	}
	return g_gamePrivateMsg;
}
module.exports = GamePrivateMsg;