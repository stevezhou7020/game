
// 游戏管理器
//      中间层: 位于底层游戏相关通信与上层UI之间(底层代码不能直接与上层UI代码耦合)
//      区别于框架消息, 将具体游戏相关的所有消息, 单独拿出来集中在此处理
//      底层游戏相关通信 -> GameMgr -> Cocos/App
//
// 		游戏相关的常量与消息ID定义全部在 cmdOx.js 文件里

var g_gameMgr = null;
var GameMgr = cc.Class({
	ctor: function() {},

	properties: {
		Status: 0,
	},

	//---------------------------------------------------------------------------------
	// 游戏状态消息
	onStatusMsg: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["cbGameStatus", "BYTE"],													//游戏状态
			["cbAllowLookon", "BYTE"],													//旁观标志
			]);

		cc.log("游戏消息:状态[onStatusMsg]:" + JSON.stringify(parseData));

		if (cc.GameMgr.Status != parseData.cbGameStatus) {
			cc.GameMgr.Status = parseData.cbGameStatus;
		}
	},

	//---------------------------------------------------------------------------------
	// 游戏场景消息
	// 任意时刻进入一个房间时, 服务器用该消息将整个场景、牌及玩家相关数据一次性同步到客户端
	// 不同状态下, 数据格式不一样, 需对应解包
	onSceneMsg: function(data) {
		switch (cc.GameMgr.Status) {
			// 空闲状态
			case GS_TK_FREE:
			case GS_TK_FINISH:
				cc.GameMgr.onSceneMsgFree(data);
				break;
			//叫庄状态
			case GS_TK_CALL:
				cc.GameMgr.onSceneMsgCall(data);
				break;
			//下注状态
			case GS_TK_SCORE:
				cc.GameMgr.onSceneMsgScore(data);
				break;
			//游戏中状态
			case GS_TK_PLAYING:
				cc.GameMgr.onSceneMsgPlaying(data);
				break;
			default:
				cc.log("游戏消息:场景[onSceneMsg]:未知状态");
				break;
		}
	},

	// 空闲状态
	onSceneMsgFree:function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lCellScore", "SCORE"],													//基础积分
			//历史积分
			["lTurnScore", "SCORE[]", PLAYER_COUNT],									//积分信息
			["lCollectScore", "SCORE[]", PLAYER_COUNT],  								//积分信息
			["szGameRoomName", "CHARS", SERVER_NAME_LEN],								//房间名称
		]);
		
		cc.log("游戏消息:场景[onSceneMsgFree]:空闲状态" + JSON.stringify(parseData));
		if (cc.Room)
			cc.Room.onSceneMsgFree(parseData);
	},

	// 叫庄状态
	onSceneMsgCall:function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lDiZhuangScore", "DWORD"],												//地庄分数
			["wCallBanker", "WORD"],													//叫庄用户
			["cbDynamicJoin", "BYTE"],													//动态加入
			["cbPlayStatus", "BYTE[]", PLAYER_COUNT],									//用户状态
			["bCallStatus", "BYTE[]", PLAYER_COUNT],									//叫庄状态
			["cbHandCardData", "BYTE[][]", PLAYER_COUNT, CARD_COUNT],					//桌面扑克
			["lTurnScore", "SCORE[]", PLAYER_COUNT],									//积分信息
			["lCollectScore", "SCORE[]", PLAYER_COUNT],									//积分信息
		]);
		
		cc.log("游戏消息:场景[onSceneMsgCall]:叫庄状态" + JSON.stringify(parseData));
	},

	// 下注状态
	onSceneMsgScore:function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lDiZhuangScore", "DWORD"],												//地庄分数
			["cbPlayStatus", "BYTE[]", PLAYER_COUNT],					 				//用户状态
			["cbDynamicJoin", "BYTE"],													//动态加入
			["lTableScore", "SCORE[]", PLAYER_COUNT],									//下注数目
			["wBankerUser", "WORD"],													//庄家用户
			["cbHandCardData", "BYTE[][]", PLAYER_COUNT, CARD_COUNT], 					//桌面扑克
			["lTurnScore", "SCORE[]", PLAYER_COUNT],									//积分信息
			["lCollectScore", "SCORE[]", PLAYER_COUNT],									//积分信息
			["szGameRoomName", "CHARS", SERVER_NAME_LEN],								//房间名称

			//扎鸟使用 其他游戏可能需要去掉
			["bZaNiaoUser", "BOOL"],									//扎鸟用户--如果不是是扎鸟就不需要判断以下条件
			["wToChairID", "WORD[]", PLAYER_COUNT],								//向用户扎鸟的用户chair ID
			["LAddScoreZN", "SCORE[]", PLAYER_COUNT],                            ////选择的扎鸟用户 加注数据
			["bZaNum", "BYTE"],													//扎鸟数目
			["DZhuChi_ZZ", "SCORE"],                                         ////转转牛牛--注池子用的
		]);
		
		cc.log("游戏消息:场景[onSceneMsgScore]:下注状态" + JSON.stringify(parseData));
		if (cc.Room)
			cc.Room.onSceneMsgScore(parseData);
	},

	// 游戏中状态
	onSceneMsgPlaying:function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lDiZhuangScore", "DWORD"],												//地庄分数
			["cbPlayStatus", "BYTE[]", PLAYER_COUNT],			 						//用户状态
			["cbDynamicJoin", "BYTE"],													//动态加入
			["lTableScore", "SCORE[]", PLAYER_COUNT],									//下注数目
			["wBankerUser", "WORD"],													//庄家用户
			//扑克信息
			["cbHandCardData", "BYTE[][]", PLAYER_COUNT, CARD_COUNT], 					//桌面扑克
			["bOxCard", "BYTE[]", PLAYER_COUNT],										//牛牛数据
			//历史积分
			["lTurnScore", "SCORE[]", PLAYER_COUNT],									//积分信息
			["lCollectScore", "SCORE[]", PLAYER_COUNT],									//积分信息
			["szGameRoomName", "CHARS", SERVER_NAME_LEN],								//房间名称
			// 扎鸟用户使用 ---- 其他游戏可能不需要
			["bZaNiaoUser", "BOOL"],									//扎鸟用户--如果不是是扎鸟就不需要判断以下条件
			["wToChairID", "WORD[]", PLAYER_COUNT],								//向用户扎鸟的用户chair ID
			["LAddScoreZN", "SCORE[]", PLAYER_COUNT],                            ////选择的扎鸟用户 加注数据
			["bZaNum", "BYTE"],													//扎鸟数目
			["DZhuChi_ZZ", "SCORE"],                                         ////转转牛牛--注池子用的
		]);
		
		cc.log("游戏消息:场景[onSceneMsgPlaying]:游戏中状态" + JSON.stringify(parseData));
		if (cc.Room)
			cc.Room.onSceneMsgPlaying(parseData);
	},

	//---------------------------------------------------------------------------------
	// 发送客户端命令(游戏逻辑消息, 如压分、打牌等)
	// 叫庄
	sendCallBanker: function(bBanker) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(1);
		dataBuilder.build([
			["bBanker", "BYTE", bBanker],										//做庄标志
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 游戏消息:叫庄[sendCallBanker]");
			cc.GameSocket.sendData(MDM_GF_GAME, SUB_C_CALL_BANKER, dataBuilder.getData());
		}
	},
	
	// 加注
	sendAddScore: function(lScore) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(8);
		dataBuilder.build([
			["lScore", "SCORE", lScore],										//加注数目
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 游戏消息:加注[sendAddScore]");
			cc.GameSocket.sendData(MDM_GF_GAME, SUB_C_ADD_SCORE, dataBuilder.getData());
		}
	},
		
	// 扎鸟
	sendZaniaoScore:function(wToChairID,LAddScoreZN,bZaNum){
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128);
		dataBuilder.build([
			["wToChairID", "WORD[]", wToChairID,PLAYER_COUNT],										//加注数目
			["LAddScoreZN", "SCORE[]", LAddScoreZN,PLAYER_COUNT],
			["wToChairID", "BYTE", bZaNum],
		]);
		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 游戏消息:扎鸟[sendAddScore]");
			cc.GameSocket.sendData(MDM_GF_GAME, SUB_C_ADDSCORE_ZANIAO, dataBuilder.getData());
		}
	},

	// 摊牌
	sendOpenCard: function(bOX) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(1);
		dataBuilder.build([
			["bOX", "BYTE", bOX],												//牛牛标志
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 游戏消息:摊牌[sendOpenCard]");
			cc.GameSocket.sendData(MDM_GF_GAME, SUB_C_OPEN_CARD, dataBuilder.getData());
		}
	},
	
	// 管理命令
	sendAdminCommand: function(cbReqType, cbCheatCount, cbCheatType, dwGameID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(8);
		dataBuilder.build([
			["cbReqType", "BYTE", cbReqType],									//请求类型
			["cbCheatCount", "BYTE", cbCheatCount],								//控制次数
			["cbCheatType", "BYTE", cbCheatType],								//控制类型
			["dwGameID", "DWORD", dwGameID],									//玩家标识
		]);

		if (cc.GameSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 游戏消息:管理命令[sendAdminCommand]");
			cc.GameSocket.sendData(MDM_GF_GAME, SUB_C_AMDIN_COMMAND, dataBuilder.getData());
		}
	},

	//---------------------------------------------------------------------------------
	// 响应服务端命令(游戏逻辑消息, 如压分、打牌等)
	onGameMsg: function(subCmd, data) {
		switch (subCmd) {
			//游戏开始
			case SUB_S_GAME_START:
				cc.GameMgr.onSubGameStart(data);
				break;
			//加注结果
			case SUB_S_ADD_SCORE:
				cc.GameMgr.onSubAddScore(data);
				break;
			//用户强退
			case SUB_S_PLAYER_EXIT:
				cc.GameMgr.onSubPlayerExit(data);
				break;
			//发牌消息
			case SUB_S_SEND_CARD:
				cc.GameMgr.onSubSendCard(data);
				break;
			//游戏结束
			case SUB_S_GAME_END:
				cc.GameMgr.onSubGameEnd(data);
				break;
			//用户摊牌
			case SUB_S_OPEN_CARD:
				cc.GameMgr.onSubOpenCard(data);
				break;
			//用户叫庄
			case SUB_S_CALL_BANKER:
				cc.GameMgr.onSubCallBanker(data);
				break;
			//发牌消息
			case SUB_S_ALL_CARD:
				cc.GameMgr.onSubAllCard(data);
				break;
			default:
				cc.log("游戏消息[onGameMsg]未知:" + subCmd);
				break;
		}		
	},

	// 游戏开始
	onSubGameStart: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wBankerUser", "WORD"],											//庄家用户
			["cbBankerMaxDouble", "BYTE"],										//庄家倍数
			["bQiangPlayer", "BOOL[]", PLAYER_COUNT],							//抢庄玩家
		]);
		
		cc.log("游戏消息:游戏开始[onSubGameStart]:" + JSON.stringify(parseData));

		if (cc.Room)
			cc.Room.onGameStart(parseData);
	},

	// 加注结果
	onSubAddScore: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wAddScoreUser", "WORD"],											//加注用户
			["lAddScoreCount", "SCORE"],										//加注数目
		]);
		
		cc.log("游戏消息:加注结果[onSubAddScore]:" + JSON.stringify(parseData));

		if (cc.Room)
			cc.Room.onAddScore(parseData);
	},
	
	// 用户强退
	onSubPlayerExit: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wPlayerID", "WORD"],												//退出用户
		]);
		
		cc.log("游戏消息:用户强退[onSubPlayerExit]:" + JSON.stringify(parseData));

		// 开始处理上层对应 UI 及逻辑
		// ...
	},
	
	// 发牌消息
	onSubSendCard: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["cbCardData", "BYTE[][]", PLAYER_COUNT, CARD_COUNT],				//用户扑克
		]);
			
		cc.log("游戏消息:发牌[onSubSendCard]:" + JSON.stringify(parseData));

		if (cc.Room)
			cc.Room.onSendCard(parseData);
	},

	// 游戏结束
	onSubGameEnd: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lDiZhuangScore", "DWORD"],										//地庄分数
			["lConfimOut", "DWORD"],											//是否下庄
			["lGameTax", "SCORE[]", PLAYER_COUNT],								//游戏税收
			["lGameScore", "SCORE[]", PLAYER_COUNT],							//游戏得分
			["cbCardData", "BYTE[]", PLAYER_COUNT],								//用户扑克
		]);
		
		cc.log("游戏消息:游戏结束[onSubGameEnd]:" + JSON.stringify(parseData));

		if (cc.Room)
			cc.Room.onGameEnd(parseData);
	},
	
	// 用户摊牌
	onSubOpenCard: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wPlayerID", "WORD"],												//摊牌用户
			["bOpen", "BYTE"],													//摊牌标志
		]);
		
		cc.log("游戏消息:摊牌[onSubOpenCard]:" + JSON.stringify(parseData));

		if (cc.Room)
			cc.Room.onOpenCard(parseData);
	},
	
	// 用户叫庄
	onSubCallBanker: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wCallChairID", "WORD"],											//叫庄用户
			["cbCallDouble", "BYTE"],											//倍数
		]);
		
		cc.log("游戏消息:叫庄[onSubCallBanker]:" + JSON.stringify(parseData));

		// 开始处理上层对应 UI 及逻辑
		// ...
	},
	
	// 发牌消息
	onSubAllCard: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["bAICount", "BOOL[]", PLAYER_COUNT],
			["cbPlayStatus", "BYTE[]", PLAYER_COUNT],							//游戏状态
			["cbCardData", "BYTE[][]", PLAYER_COUNT, CARD_COUNT],				//用户扑克
			["bIsQiang", "BOOL"],												//是否是抢庄
		]);
		
		cc.log("游戏消息:发牌[onSubAllCard]:" + JSON.stringify(parseData));

		if (cc.Room)
			cc.Room.onSendAllCard(parseData);
	},
});

GameMgr.getInstance = function() {
	if(g_gameMgr == null){
		g_gameMgr = new GameMgr();
	}
	return g_gameMgr;
}
module.exports = GameMgr;