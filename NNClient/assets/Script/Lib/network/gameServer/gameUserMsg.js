
var g_gameUserMsg = null;
var GameUserMsg = cc.Class({
	ctor: function(){},

	//---------------------------------------------------------------------------------
	// 发送坐下消息
	sendUserSitDown: function(wTableID, wChairID, szPassword) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128);
		dataBuilder.build([
			["wTableID", "WORD", wTableID],												//桌子号码
			["wChairID", "WORD", wChairID],												//椅子号码
			["szPassword", "CHARS", szPassword, LEN_PASSWORD],							//桌子密码
			]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 用户坐下[sendDismissPrivate]");
			cc.GameSocket.sendData(MDM_GR_USER, SUB_GR_USER_SITDOWN, dataBuilder.getData());
		}
	},
	
	// 起立请求
	sendStandUp: function(wTableID, wChairID, cbForceLeave){
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(5);
		dataBuilder.build([
		                   ["wTableID", "WORD", wTableID],								//桌子位置
		                   ["wChairID", "WORD", wChairID],								//椅子位置
		                   ["cbForceLeave", "BYTE", cbForceLeave],						//强行离开
		                   ]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 用户起立[sendDismissPrivate]");
			cc.GameSocket.sendData(MDM_GR_USER, SUB_GR_USER_STANDUP, dataBuilder.getData());
		}
	},

	// 请求更换位置（快速坐下）
	sendUserChairReq: function() {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(0);
		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 用户更换位置[sendDismissPrivate]");
			cc.GameSocket.sendData(MDM_GR_USER, SUB_GR_USER_CHAIR_REQ, dataBuilder.getData());
		}
	},
	
	// 发送用户表情
	sendUserExpression: function(wItemIndex, dwTargetUserID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(20);
		dataBuilder.build([
			["wItemIndex", "WORD",wItemIndex],  										// 表情索引
			["dwTargetUserID", "DWORD",dwTargetUserID]									// 目标用户
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 用户表情[sendUserExpression] "+ wItemIndex);
			cc.GameSocket.sendData(MDM_GR_USER, SUB_GR_USER_EXPRESSION, dataBuilder.getData());
		}
	},

	//---------------------------------------------------------------------------------
	// 响应用户命令
	onMainUser: function(subCmd, data){
		switch (subCmd) {
			/////////////////////////////用户状态////////////////////////////////
			//用户进入
			case SUB_GR_USER_ENTER:
				cc.GameUserMsg.onSubUserEnter(data);
				break;								
			//用户分数
			case SUB_GR_USER_SCORE:
				cc.GameUserMsg.onSubUserScore(data);
				break;								
			//用户状态
			case SUB_GR_USER_STATUS:
				cc.GameUserMsg.onSubUserStatus(data);
				break;							
			//请求失败
			case SUB_GR_REQUEST_FAILURE:
				cc.GameUserMsg.onSubRequestFailure(data);
				break;
			/////////////////////////////聊天命令////////////////////////////////
			//聊天信息
			case SUB_GR_USER_CHAT:
				cc.GameUserMsg.onSubUserChat(data);
				break;
			//表情消息
			case SUB_GR_USER_EXPRESSION:
				cc.GameUserMsg.onSubUserExpression(data);
				break;								
			//私聊消息
			case SUB_GR_WISPER_CHAT:
				cc.GameUserMsg.onSubWisperChat(data);
				break;
			//私聊表情
			case SUB_GR_WISPER_EXPRESSION:
				cc.GameUserMsg.onSubWisperExpression(data);
				break;
			//会话消息
			case SUB_GR_COLLOQUY_CHAT:
				cc.GameUserMsg.onSubColloquyChat(data);
				break;
			//会话表情
			case SUB_GR_COLLOQUY_EXPRESSION:
				cc.GameUserMsg.onSubColloquyExpression(data);
				break;
			/////////////////////////////道具命令////////////////////////////////
			//购买道具
			case SUB_GR_PROPERTY_BUY:
				cc.GameUserMsg.onSubPropertyBuy(data);
				break;
			//道具成功
			case SUB_GR_PROPERTY_SUCCESS:
				cc.GameUserMsg.onSubPropertySuccess(data);
				break;
			//道具失败
			case SUB_GR_PROPERTY_FAILURE:
				cc.GameUserMsg.onSubPropertyFailure(data);
				break;
			//道具消息
			case SUB_GR_PROPERTY_MESSAGE:
				cc.GameUserMsg.onSubPropertyMessage(data);
				break;
			//道具效应
			case SUB_GR_PROPERTY_EFFECT:
				cc.GameUserMsg.onSubPropertyEffect(data);
				break;
			//用户喇叭
			case SUB_GR_PROPERTY_TRUMPET:
				cc.GameUserMsg.onSubPropertyTrumpet(data);
				break;
			default:
				break;
		}
	},

	// 用户进入
	onSubUserEnter: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var dataByteLen = data.byteLength;

		var parseData = dataParser.parse([
			//用户属性
			["dwGameID", "DWORD"],														//游戏 I D
			["dwUserID", "DWORD"],														//用户 I D
			["dwGroupID", "DWORD"],														//社团 I D
			//头像信息
			["wFaceID", "WORD"],														//头像索引
			["dwCustomID", "DWORD"],													//自定标识
			//用户属性
			["cbGender", "BYTE"],														//用户性别
			["cbMemberOrder", "BYTE"],													//会员等级
			["cbMasterOrder", "BYTE"],													//管理等级
			//用户状态
			["wTableID", "WORD"],														//桌子索引
			["wChairID", "WORD"],														//椅子索引
			["cbUserStatus", "BYTE"],													//用户状态
			//积分信息
			["lScore", "SCORE"],														//用户分数
			["lGrade", "SCORE"],														//用户成绩
			["lInsure", "SCORE"],														//用户银行
			//游戏信息
			["dwWinCount", "DWORD"],													//胜利盘数
			["dwLostCount", "DWORD"],													//失败盘数
			["dwDrawCount", "DWORD"],													//和局盘数
			["dwFleeCount", "DWORD"],													//逃跑盘数
			["dwUserMedal", "DWORD"],													//用户奖牌
			["dwExperience", "DWORD"],													//用户经验
			["lLoveLiness", "LONG"],													//用户魅力
			]);

		// 扩展信息
		while (true) {
			var offset = dataParser.getOffset();
			if (offset >= dataByteLen){
				break;
			}

			var extData = dataParser.parse([
			    ["wDataSize", "WORD"],													//数据大小
			    ["wDataDescribe", "WORD"],												//数据描述
			]);

			if (extData.wDataDescribe === 0) {
				break;
			}

			switch(extData.wDataDescribe) {
				case DTP_GR_NICK_NAME:													//用户昵称
					parseData.szNickName = dataParser.readCharArray(extData.wDataSize);
					break;
				case DTP_GR_GROUP_NAME:													//社团名字
					parseData.szGroupName = dataParser.readCharArray(extData.wDataSize);
					break;
				case DTP_GR_UNDER_WRITE:												//个性签名
					parseData.szUnderWrite = dataParser.readCharArray(extData.wDataSize);
					break;
			}
		}
		
		cc.log("用户进入[onSubUserEnter]:" + JSON.stringify(parseData));

		// 旁观暂时不处理
		if (parseData.cbUserStatus == US_LOOKON)
			return;

		var player = cc.PlayerMgr.getPlayer(parseData.dwUserID);
		if (player) {
			player.userInfo = parseData;
			cc.NetMgr.onGameUserEnter(player);
        }
	},
	
	// 用户分数
	onSubUserScore: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["dwUserID", "DWORD"],														//用户标识
			["UserScore", "STRUCT", [
				//积分信息
				["lScore", "SCORE"],													//用户分数
				["lGrade", "SCORE"],													//用户成绩
				["lInsure", "SCORE"],													//用户银行
				//输赢信息
				["dwWinCount", "DWORD"],												//胜利盘数
				["dwLostCount", "DWORD"],												//失败盘数
				["dwDrawCount", "DWORD"],												//和局盘数
				["dwFleeCount", "DWORD"],												//逃跑盘数
				//全局信息
				["dwUserMedal", "DWORD"],												//用户奖牌
				["dwExperience", "DWORD"],												//用户经验
				["lLoveLiness", "LONG"],												//用户魅力
			]],
		]);
		
		cc.log("用户分数[onSubUserScore]:" + JSON.stringify(parseData));

		var player = cc.PlayerMgr.getPlayer(parseData.dwUserID);
		if (player && player.userInfo) {
			player.userInfo.lScore = parseData.UserScore.lScore;
			player.accountInfo.lInsure = parseData.UserScore.lInsure;
			cc.NetMgr.onGameUserScore(player);
        }
	},
									
	// 用户状态
	onSubUserStatus: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["dwUserID", "DWORD"],														//用户标识
			//用户状态
			["UserStatus", "STRUCT", [
				["wTableID", "WORD"],													//桌子索引
				["wChairID", "WORD"],													//椅子位置
				["cbUserStatus", "BYTE"],												//用户状态
				]]
			]);

		// 旁观暂时不处理
		if (parseData.UserStatus.cbUserStatus == US_LOOKON)
			return;
		
		var player = cc.PlayerMgr.getPlayer(parseData.dwUserID);
		if (!player || !player.userInfo)
			return;
		
		// 状态改变
		if (parseData.UserStatus.cbUserStatus != player.userInfo.cbUserStatus
		|| parseData.UserStatus.wTableID != player.userInfo.wTableID
		|| parseData.UserStatus.wChairID != player.userInfo.wChairID) {
			var prevStatus = player.userInfo.cbUserStatus;
			var prevTableID = player.userInfo.wTableID;
			var prevChairID = player.userInfo.wChairID;
			player.userInfo.cbUserStatus = parseData.UserStatus.cbUserStatus;
			player.userInfo.wTableID = parseData.UserStatus.wTableID;
			player.userInfo.wChairID = parseData.UserStatus.wChairID;

			cc.log("用户状态[onSubUserStatus][改变]:" + JSON.stringify(parseData));
			cc.NetMgr.onGameUserStatus(player, prevStatus, prevTableID, prevChairID);
		}
	},
								
	// 请求失败
	onSubRequestFailure: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lErrorCode", "DWORD"],													//错误代码
			["szDescribeString", "CHARS", 256],  										//描述消息
			]);

		cc.log("请求失败[onSubRequestFailure]:" + JSON.stringify(parseData));
	},
	
	//---------------------------------------------------------------------------------
	// 响应聊天信息
	onSubUserChat: function(data) {
		cc.log("### 游戏服，（用户命令 /聊天命令）聊天信息");
	},
	
	// 表情消息
	onSubUserExpression: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wItemIndex", "WORD"],														//表情索引
			["dwSendUserID", "DWORD"],													//发送用户
			["dwTargetUserID", "DWORD"],												//目标用户
		]);
		
		cc.log("表情消息[onSubUserExpression]:" + JSON.stringify(parseData));
		var senderPlayer = cc.PlayerMgr.getPlayer(parseData.dwSendUserID);
		var targetPlayer = parseData.dwTargetUserID ? cc.PlayerMgr.getPlayer(parseData.dwTargetUserID) : null;
		if (senderPlayer && senderPlayer.userInfo)
			cc.NetMgr.onGameUserExpression(parseData.wItemIndex, senderPlayer, targetPlayer);
	},
									
	// 私聊消息
	onSubWisperChat: function(data) {
		cc.log("### 游戏服，（用户命令 /聊天命令）私聊消息");
	},
	
	// 私聊表情
	onSubWisperExpression: function(data) {
		cc.log("### 游戏服，（用户命令 /聊天命令）私聊表情");
	},
	
	// 会话消息
	onSubColloquyChat: function(data) {
		cc.log("### 游戏服，（用户命令 /聊天命令）会话消息");
	},
	
	// 会话表情
	onSubColloquyExpression: function(data) {
		cc.log("### 游戏服，（用户命令 /聊天命令）会话表情");
	},
	
	//---------------------------------------------------------------------------------
	// 响应购买道具
	onSubPropertyBuy: function(data) {
		cc.log("### 游戏服，（用户命令 /道具命令）购买道具");
	},
	
	// 道具成功
	onSubPropertySuccess: function(data) {
		cc.log("### 游戏服，（用户命令 /道具命令）道具成功");
	},
	
	// 道具失败
	onSubPropertyFailure: function(data) {
		cc.log("### 游戏服，（用户命令 /道具命令）道具失败");
	},
	
	// 道具消息
	onSubPropertyMessage: function(data) {
		cc.log("### 游戏服，（用户命令 /道具命令）道具消息");
	},
	
	// 道具效应
	onSubPropertyEffect: function(data) {
		cc.log("### 游戏服，（用户命令 /道具命令）道具效应");
	},
	
	// 用户喇叭
	onSubPropertyTrumpet: function(data) {
		cc.log("### 游戏服，（用户命令 /道具命令）用户喇叭");
	},
});

GameUserMsg.getInstance = function(){
	if(g_gameUserMsg == null){
		g_gameUserMsg = new GameUserMsg();
	}
	return g_gameUserMsg;
}
module.exports = GameUserMsg;