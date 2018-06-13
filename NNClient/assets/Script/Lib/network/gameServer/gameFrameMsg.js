
var g_gameFrameMsg = null;
var GameFrameMsg = cc.Class({
	ctor: function(){},

	//---------------------------------------------------------------------------------
	// 发送游戏配置（重连、进入房间、坐下）
	sendGameOption: function() {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(9);
		dataBuilder.build([
			["cbAllowLookon", "BYTE", 0],												//旁观标志
			["dwFrameVersion", "DWORD", VERSION_FRAME],									//框架版本
			["dwClientVersion", "DWORD", VERSION_FRAME],								//游戏版本
			]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 游戏配置[sendGameOption]");
			cc.GameSocket.sendData(MDM_GF_FRAME, SUB_GF_GAME_OPTION, dataBuilder.getData());
		}
	},
	
	// 发送用户准备
	sendUserReady: function(dwUserID, wTableID, wChairID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(9);
		dataBuilder.build([
			//用户标识
			["dwUserID", "DWORD", dwUserID],
			//用户状态
			["UserStatus", "STRUCT", [
				["wTableID", "WORD", wTableID],											//桌子索引
				["wChairID", "WORD", wChairID],											//椅子位置
				["cbUserStatus", "BYTE", US_READY],										//用户状态
				]]
			]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 用户准备[sendUserReady]");
			cc.GameSocket.sendData(MDM_GF_FRAME, SUB_GF_USER_READY, dataBuilder.getData());
		}
	},
	
	// 发送同桌语音
	sendTableTalk: function(dwUserID, data) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(data.byteLength + 8);
		dataBuilder.build([
			["dwUserID", "DWORD", dwUserID],											//用户标识
			["dwSize", "DWORD", data.byteLength],										//内容长度
			["cbData", "BUFFER", data],													//语音内容
			]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 发送同桌语音[sendTableTalk]");
			cc.GameSocket.sendData(MDM_GF_FRAME, SUB_GR_TABLE_TALK, dataBuilder.getData());
		}
	},

	//---------------------------------------------------------------------------------
	// 响应游戏框架命令
	onMainGameFrame: function(subCmd, data) {
		switch (subCmd) {
			//用户聊天
			case SUB_GF_USER_CHAT:
				cc.GameFrameMsg.onSubGFUserChat(data);
				break;
			//用户表情
			case SUB_GF_USER_EXPRESSION:
				cc.GameFrameMsg.onSubGFUserExpression(data);
				break;
			//同桌语音
			case SUB_GR_TABLE_TALK:
				cc.GameFrameMsg.onSubGFTableTalk(data);
			//游戏状态
			case SUB_GF_GAME_STATUS:
				cc.GameMgr.onStatusMsg(data);
				break;
			//游戏场景
			case SUB_GF_GAME_SCENE:
				cc.GameMgr.onSceneMsg(data);
				break;
			//系统消息
			case SUB_GF_SYSTEM_MESSAGE:	
				cc.GameFrameMsg.onSubGFSystemMessage(data);
				break;
			default:
				break;
		}
	},
	
	// 用户聊天
	onSubGFUserChat: function(data) {
		cc.log("用户聊天[onSubGFUserChat]");
	},
	
	// 用户表情
	onSubGFUserExpression: function(data) {
		cc.log("用户表情[onSubGFUserExpression]");
	},

	// 同桌语音
	onSubGFTableTalk: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["dwUserID", "DWORD"],														//用户标识
			["dwSize", "DWORD"],														//内容长度
			]);
		
		if (parseData.dwSize > 0) {
			parseData.cbData = dataParser.readArrayBuffer(parseData.dwSize);			//语音内容
			cc.log("同桌语音[onSubGFTableTalk]");
			cc.NetMgr.onTableTalk(parseData);
		}
	},

	// 系统消息
	onSubGFSystemMessage: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);

		var parseData1 = dataParser.parse([
			["wType", "WORD"],  														//消息类型
			["wLength", "WORD"],														//消息长度
			]);

		var parseData2 = dataParser.parse([
			["szString", "CHARS", parseData1.wLength],  								//消息内容
			]);

		cc.log("系统消息[onSubGFSystemMessage]:" + JSON.stringify(parseData1) + "|" + JSON.stringify(parseData2));
				
		// 关闭处理
		if ((parseData1.wType & (SMT_CLOSE_ROOM|SMT_CLOSE_LINK)) != 0) {
		}

		// 关闭房间
		if (parseData1.wType & SMT_CLOSE_GAME) {
		}
		
		// 弹出消息
		if ((parseData1.wType & SMT_EJECT) || (parseData1.wType & SMT_TABLE_ROLL)) {
		}
	},	
});

GameFrameMsg.getInstance = function(){
	if(g_gameFrameMsg == null){
		g_gameFrameMsg = new GameFrameMsg();
	}
	return g_gameFrameMsg;
}
module.exports = GameFrameMsg;