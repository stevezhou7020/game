
var g_userServiceMsg = null;
var UserServiceMsg = cc.Class({
    ctor: function(){
        this.operateTag = null;
        this.operateData = null;
    },
	
	setOperate: function(tag, data){
		cc.UserServiceMsg.operateTag = tag;
		cc.UserServiceMsg.operateData = data;
	},
	clearOperate: function(){
		cc.UserServiceMsg.operateTag = null;
		cc.UserServiceMsg.operateData = null;
	},
	getOperateTag: function(){
		return cc.UserServiceMsg.operateTag;
	},
	getOperateData: function(){
		return cc.UserServiceMsg.operateData;
	},

	//---------------------------------------------------------------------------------
	// 发送修改个性签名
	sendModifyUnderWrite: function(dwUserID, szPassword, szUnderWrite) {
		var lenUnderWrite = szUnderWrite.length + 1; //字符串以字符'\0'结束

		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128 + lenUnderWrite);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ["szPassword", "CHARS", szPassword, LEN_PASSWORD],			//用户密码
		                   ["szUnderWrite", "CHARS", szUnderWrite, lenUnderWrite],		//个性签名
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED){
			cc.log("-> 修改个性签名[sendModifyUnderWrite]");
			cc.UserServiceMsg.setOperate(SUB_GP_MODIFY_UNDER_WRITE, szUnderWrite);
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_MODIFY_UNDER_WRITE, dataBuilder.getData());
		}
	},
	
	// 修改密码
	sendModifyPassword: function(dwUserID, szPassword, szNewPassword) {
		var md5DesPass = szNewPassword; // cc.CryptoUtil.md5(szNewPassword);
		var md5ScrPass = szPassword; // cc.CryptoUtil.md5(szPassword);

		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ["szDesPassword", "CHARS", md5DesPass, LEN_PASSWORD],		//用户密码
		                   ["szScrPassword", "CHARS", md5ScrPass, LEN_PASSWORD],		//用户原密码
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 修改密码[sendModifyPassword]");
			cc.UserServiceMsg.setOperate(SUB_GP_MODIFY_LOGON_PASS, md5DesPass);
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_MODIFY_LOGON_PASS, dataBuilder.getData());
		}
	},
	
	// 修改头像
	sendModifyFaceId: function(dwUserID, szPassword, wFaceID) {
		var machineId = cc.LocalStorageMgr.getUuidItem();
		
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(128);
		dataBuilder.build([
		                   ["wFaceID", "WORD", wFaceID],								//头像标识
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ["szPassword", "CHARS", szPassword, LEN_PASSWORD],			//用户密码
		                   ["szMachineID", "CHARS", machineId, LEN_PASSWORD],			//机器序列
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 修改头像[sendModifyFaceId]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_SYSTEM_FACE_INFO, dataBuilder.getData());
		}
	},
			
	// 查询公告信息
	sendQueryPublicNotice: function(szKeyName) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(LEN_NICKNAME);
		dataBuilder.build([
		                   ["szKeyName", "CHARS", szKeyName, LEN_NICKNAME],				//关键字
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询公告信息[sendQueryPublicNotice]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_QUERY_PUBLIC_NOTICE, dataBuilder.getData());
		}
	},

	// 查询帐号信息
	sendQueryAccountInfo: function(dwUserID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询帐号信息[sendQueryAccountInfo]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_QUERY_ACCOUNTINFO, dataBuilder.getData());
		}
	},

	// 查询个人资料
	sendQueryIndividual: function(dwUserID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询个人资料[sendQueryIndividual]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_QUERY_INDIVIDUAL, dataBuilder.getData());
		}
	},

	// 修改个人信息
	sendModifyIndividual: function(dwUserID, szPassword, cbGender, szData, wDataDescribe) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(512);
		dataBuilder.build([
		                   ["cbGender", "BYTE", cbGender],								//用户性别
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ["szPassword", "CHARS", szPassword, LEN_PASSWORD],			//用户密码
						   ["tagDataDescribe", "STRUCT", [
								["wDataSize", "WORD", szData.length + 1],				//数据大小
								["wDataDescribe", "WORD", wDataDescribe],				//数据描述
								["szData", "CHARS", szData, szData.length + 1],			//用户状态
								]]
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 修改个人信息[sendModifyIndividual]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_MODIFY_INDIVIDUAL, dataBuilder.getData());
		}
	},

	// 查询游戏记录列表
	sendQueryGameRecordList: function(dwUserID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询游戏记录列表[sendQueryGameRecordList]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_GAME_RECORD_LIST, dataBuilder.getData());
		}
	},

	// 查询游戏记录全部内容
	sendQueryGameRecordTotal: function(dwUserID, dwRecordID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(8);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ["dwRecordID", "DWORD", dwRecordID],							//记录 I D
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询游戏记录全部内容[sendQueryGameRecordTotal]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_GAME_RECORD_TOTAL, dataBuilder.getData());
		}
	},
	
	// 查询游戏记录子内容
	sendQueryGameRecordChild: function(dwUserID, dwRecordID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(8);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ["dwRecordID", "DWORD", dwRecordID],							//记录 I D
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询游戏记录子内容[sendQueryGameRecordChild]");
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_GAME_RECORD_CHILD, dataBuilder.getData());
		}
	},

	// 查询已在游戏服
	sendQueryIngameServerId: function(dwUserID) {
		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(4);
		dataBuilder.build([
		                   ["dwUserID", "DWORD", dwUserID],								//用户 I D
		                   ]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 查询已在游戏服[sendQueryIngameServerId]");
			cc.UserServiceMsg.setOperate(SUB_GP_QUERY_INGAME_SEVERID, dwUserID);
			cc.LogonSocket.sendData(MDM_GP_USER_SERVICE, SUB_GP_QUERY_INGAME_SEVERID, dataBuilder.getData());
		}
	},

	//---------------------------------------------------------------------------------
	// 响应服务消息
	onMainUserService: function(subCmd, data) {
		switch (subCmd) {
		//操作成功
		case SUB_GP_OPERATE_SUCCESS:
			cc.UserServiceMsg.onSubOperateSuccess(data);
			break;
		//操作失败
		case SUB_GP_OPERATE_FAILURE:
			cc.UserServiceMsg.onSubOperateFailure(data);
			break;
		//修改头像
		case SUB_GP_USER_FACE_INFO:
			cc.UserServiceMsg.onSubUserFaceInfo(data);
			break;
		//查询公告信息
		case SUB_GP_PUBLIC_NOTICE:
			cc.UserServiceMsg.onSubQueryPublicNotice(data);
			break;
		//查询玩家帐号资料
		case SUB_GP_QUERY_ACCOUNTINFO:
			cc.UserServiceMsg.onSubQueryAccountInfo(data);
			break;
		//查询玩家个人资料
		case SUB_GP_USER_INDIVIDUAL:
			cc.UserServiceMsg.onSubUserIndividual(data);
			break;
		//查询游戏记录列表
		case SUB_GP_GAME_RECORD_LIST:
			cc.UserServiceMsg.onSubGameRecordList(data);
			break;
		//查询游戏记录全部内容
		case SUB_GP_GAME_RECORD_TOTAL:
			cc.UserServiceMsg.onSubGameRecordTotal(data);
			break;
		//查询游戏记录子内容
		case SUB_GP_GAME_RECORD_CHILD:
			cc.UserServiceMsg.onSubGameRecordChild(data);
			break;
		//查询已在游戏服
		case SUB_GP_QUERY_INGAME_SEVERID:
			cc.UserServiceMsg.onSubQueryIngameServerId(data);
			break;
		default:
			break;
		}
	},
	
	// 操作成功
	onSubOperateSuccess: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
		                                  ["lResultCode", "DWORD"],						//错误代码
		                                  ["szDescribeString", "CHARS", 128],			//描述消息
		                                  ]);

		//操作
		var operateTag = cc.UserServiceMsg.getOperateTag();
		var operateData = cc.UserServiceMsg.getOperateData();

		switch (operateTag) {
		//修改个性签名操作
		case SUB_GP_MODIFY_UNDER_WRITE:
			break;
		//修改密码
		case SUB_GP_MODIFY_LOGON_PASS:
			var md5Pass = operateData;
			break;
		default:
			break;
		}
		
		cc.UserServiceMsg.clearOperate();

		cc.log("服务操作成功[onSubOperateSuccess]:" + JSON.stringify(parseData));
	},

	// 操作失败
	onSubOperateFailure: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
		                                  ["lResultCode", "DWORD"],						//错误代码
		                                  ["szDescribeString", "CHARS", 128],			//描述消息
		                                  ]);
		cc.UserServiceMsg.clearOperate();
		
		cc.log("服务操作失败[onSubOperateFailure]:" + JSON.stringify(parseData));
	},

	// 修改头像
	onSubUserFaceInfo: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
		                                  ["wFaceID", "WORD"],							//头像标识
		                                  ["dwCustomID", "DWORD"],						//自定索引
		                                  ]);

		cc.log("修改头像[onSubUserFaceInfo]:" + JSON.stringify(parseData));
	},
	
	// 查询公告信息
	onSubQueryPublicNotice: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//属性资料
			["lResultCode", "LONG"], 													//操作代码
			["szDescribeString", "CHARS", 512],											//成功消息
		]);
		cc.log("查询公告信息[onSubQueryPublicNotice]:" + JSON.stringify(parseData));
		cc.NetMgr.onLogonQueryPublicNoticeResult(parseData);
	},

	// 查询玩家帐号信息
	onSubQueryAccountInfo: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//属性资料
			["wFaceID", "WORD"], 														//头像标识
			["dwUserID", "DWORD"], 														//用户 I D
			["dwGameID", "DWORD"], 														//游戏标识
			["dwGroupID", "DWORD"], 													//社团标识
			["dwCustomID", "DWORD"], 													//自定索引
			["dwUserMedal", "DWORD"], 													//用户奖牌
			["dwExperience", "DWORD"], 													//经验数值
			["dwLoveLiness", "DWORD"], 													//用户魅力
			["dwSpreaderID", "DWORD"], 													//推广ID
			["szPassword", "CHARS", LEN_PASSWORD],										//登录密码
			["szAccounts", "CHARS", LEN_ACCOUNTS],										//登录帐号
			["szNickName", "CHARS", LEN_NICKNAME],										//用户昵称
			["szGroupName", "CHARS", LEN_GROUP_NAME],									//社团名字	
			["szLogonIp", "CHARS", LEN_ACCOUNTS],										//登录IP	
			//用户成绩
			["lScore", "SCORE"], 														//用户金币
			["lInsure", "SCORE"], 														//用户银行
			//用户资料
			["cbGender", "BYTE"], 														//用户性别
			["cbMoorMachine", "BYTE"], 													//锁定机器
			//会员资料			
			["cbMemberOrder", "BYTE"], 													//会员等级
			["MemberOverDate", "SYSTEMTIME"], 											//到期时间
		]);
		
		cc.log("查询帐号信息[onSubQueryAccountInfo]:" + JSON.stringify(parseData));

		var player = cc.PlayerMgr.getPlayer(parseData.dwUserID);
		if (player) {
			player.accountInfo = parseData;
			cc.NetMgr.onLogonQueryInfoResult(player);
		}
	},

	// 查询玩家个人资料
	onSubUserIndividual: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var dataByteLen = data.byteLength;

		var individual = {
			dwUserID: 0,
			dwUserStarValue: 0,
			dwUserStarCout: 0,
			//用户信息
			szUserNote: "",																//用户说明
			szCompellation: "",															//真实名字
			//电话号码
			szSeatPhone: "",															//固定电话
			szMobilePhone: "",															//移动电话
			//联系资料
			szQQ: "",																	//Q Q 号码
			szEMail: "",																//电子邮件
			szDwellingPlace: "",														//联系地址
			szHeadHttp: "",																//头像http
			szLogonIP: "",																//IP
			szUserChannel: "",															//渠道号
			szUserGps: "",																//GPS
		};

		var parseData = dataParser.parse([
		    ["dwUserID", "DWORD"],														//用户 I D
		    ["dwUserStarValue", "DWORD"],												//评分
		    ["dwUserStarCout", "DWORD"],												//评分
		]);
		individual.dwUserID = parseData.dwUserID;
		individual.dwUserStarValue = parseData.dwUserStarValue;
		individual.dwUserStarCout = parseData.dwUserStarCout;

		// 扩展信息
		while (true) {
			var offset = dataParser.getOffset();
			if (offset >= dataByteLen){
				break;
			}

			parseData = dataParser.parse([
			    ["wDataSize", "WORD"],													//数据大小
			    ["wDataDescribe", "WORD"],												//数据描述
			]);

			if (parseData.wDataDescribe === 0) {
				break;
			}

			switch(parseData.wDataDescribe) {
				case DTP_GP_UI_USER_NOTE:												//用户备注
					individual.szUserNote = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_COMPELLATION:											//真实名字
					individual.szCompellation = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_SEAT_PHONE:												//固定电话
					individual.szSeatPhone = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_MOBILE_PHONE:											//移动电话
					individual.szMobilePhone = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_QQ:														//Q Q 号码
					individual.szQQ = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_EMAIL:													//电子邮件
					individual.szEMail = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_DWELLING_PLACE:											//联系地址
					individual.szDwellingPlace = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_HEAD_HTTP:												//头像http
					individual.szHeadHttp = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_IP:														//IP
					individual.szLogonIP = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_CHANNEL:													//渠道号
					individual.szUserChannel = dataParser.readCharArray(parseData.wDataSize);
					break;
				case DTP_GP_UI_GPS:														//GPS
					individual.szUserGps = dataParser.readCharArray(parseData.wDataSize);
					break;
			}
		}
		
		cc.log("查询个人资料[onSubUserIndividual]:" + JSON.stringify(individual));

		var player = cc.PlayerMgr.getPlayer(individual.dwUserID);
		if (player) {
			player.individualInfo = individual;
			cc.NetMgr.onLogonQueryInfoResult(player);
		}
	},

	// 查询游戏记录列表
	onSubGameRecordList: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var dataByteLen = data.byteLength;

		var TotalRecordList = {};
		TotalRecordList.dwUserID = dataParser.readDWord();
		TotalRecordList.kListSize = dataParser.readDWord();
		TotalRecordList.kList = [];

		// kList
		for (var i = 0; i < TotalRecordList.kListSize; ++i) {
			var offset = dataParser.getOffset();
			if (offset >= dataByteLen)
				break;

			TotalRecordList.kList[i] = {};
			var kList = TotalRecordList.kList[i];

			kList.iRoomNum = dataParser.readDWord();
			kList.kUserIDSize = dataParser.readDWord();
			kList.kUserID = dataParser.readDWordArray(kList.kUserIDSize);

			kList.kNickNameSize = dataParser.readDWord();
			kList.kNickName = [];
			for (var j = 0; j < kList.kNickNameSize; ++j)
				kList.kNickName[j] = dataParser.readCharArray(dataParser.readDWord());

			kList.kScoreSize = dataParser.readDWord();
			kList.kScore = dataParser.readIntArray(kList.kScoreSize);

			var kPlayTime = dataParser.parse([["kPlayTime", "SYSTEMTIME"]]);
			kList.kPlayTime = kPlayTime.kPlayTime;

			// kRecordChild
			kList.kRecordChildSize = dataParser.readDWord();
			kList.kRecordChild = [];
			for (var j = 0; j < kList.kRecordChildSize; ++j) {
				var offset = dataParser.getOffset();
				if (offset >= dataByteLen)
					break;

				kList.kRecordChild[j] = {};
				var kRecordChild = kList.kRecordChild[j];

				kRecordChild.iRecordID = dataParser.readDWord();
				kRecordChild.iRecordChildID = dataParser.readDWord();
				kRecordChild.kScoreSize = dataParser.readDWord();
				kRecordChild.kScore = dataParser.readIntArray(kRecordChild.kScoreSize);

				// NNGameRecord
				kRecordChild.kNNGameRecord = {};
				var kNNGameRecord = kRecordChild.kNNGameRecord;
				kNNGameRecord.kDataSize = dataParser.readDWord();
				kNNGameRecord.kPlayersSize = dataParser.readDWord();
				kNNGameRecord.kPlayers = [];
				for (var k = 0; k < kNNGameRecord.kPlayersSize; ++k) {
					var offset = dataParser.getOffset();
					if (offset >= dataByteLen)
						break;

					kNNGameRecord.kPlayers[k] = {};
					var kPlayer = kNNGameRecord.kPlayers[k];
					kPlayer.dwUserID = dataParser.readDWord();
					kPlayer.kHead = dataParser.readCharArray(dataParser.readDWord());
					kPlayer.kNickName = dataParser.readCharArray(dataParser.readDWord());
					kPlayer.cbCardData = dataParser.readByteArray(dataParser.readDWord());
				}

				kNNGameRecord.kActionSize = dataParser.readDWord();
				kNNGameRecord.kAction = [];
				for (var k = 0; k < kNNGameRecord.kActionSize; ++k) {
					var offset = dataParser.getOffset();
					if (offset >= dataByteLen)
						break;

					kNNGameRecord.kAction[k] = {};
					var kAction = kNNGameRecord.kAction[k];
					kAction.cbActionType = dataParser.readByte();
					kAction.bOx = dataParser.readByte();
					kAction.lUserID = dataParser.readDWordArray(dataParser.readDWord());

					kAction.lGameScoreSize = dataParser.readDWord();
					kAction.lGameScore = [];
					for (var m = 0; m < kAction.lGameScoreSize; ++m) {
						var offset = dataParser.getOffset();
						if (offset >= dataByteLen)
							break;

						kAction.lGameScore[m] = {};
						var lGameScore = kAction.lGameScore[m];
						lGameScore.UserID = dataParser.readDWord();
						lGameScore.GameScore = dataParser.readInt64Number();
					}
				}
					
				kNNGameRecord.dwKindID = dataParser.readDWord();
				kNNGameRecord.dwVersion = dataParser.readDWord();

				// others
				var kPlayTime = dataParser.parse([["kPlayTime", "SYSTEMTIME"]]);
				kRecordChild.kPlayTime = kPlayTime.kPlayTime;
				kRecordChild.kUserDefine = dataParser.readCharArray(dataParser.readDWord());
				kRecordChild.dwKindID = dataParser.readDWord();
				kRecordChild.dwVersion = dataParser.readDWord();
			}

			// others
			kList.iRecordID = dataParser.readDWord();
			kList.kUserDefine = dataParser.readCharArray(dataParser.readDWord());
			kList.dwKindID = dataParser.readDWord();
			kList.dwVersion = dataParser.readDWord();
		}

		cc.log("查询游戏记录列表[onSubGameRecordList]:" + JSON.stringify(TotalRecordList));
		cc.NetMgr.onLogonQueryGameRecordListResult(TotalRecordList);
	},
	
	// 查询游戏记录全部内容
	onSubGameRecordTotal: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var dataByteLen = data.byteLength;

		// 复制的是上面的代码, 所以命名不合适, 实际上这里的 kList 是 kTotalRecord
		var kList = {};
		kList.iRoomNum = dataParser.readDWord();
		kList.kUserIDSize = dataParser.readDWord();
		kList.kUserID = dataParser.readDWordArray(kList.kUserIDSize);

		kList.kNickNameSize = dataParser.readDWord();
		kList.kNickName = [];
		for (var j = 0; j < kList.kNickNameSize; ++j)
			kList.kNickName[j] = dataParser.readCharArray(dataParser.readDWord());

		kList.kScoreSize = dataParser.readDWord();
		kList.kScore = dataParser.readIntArray(kList.kScoreSize);

		var kPlayTime = dataParser.parse([["kPlayTime", "SYSTEMTIME"]]);
		kList.kPlayTime = kPlayTime.kPlayTime;

		// kRecordChild
		kList.kRecordChildSize = dataParser.readDWord();
		kList.kRecordChild = [];
		for (var j = 0; j < kList.kRecordChildSize; ++j) {
			var offset = dataParser.getOffset();
			if (offset >= dataByteLen)
				break;

			kList.kRecordChild[j] = {};
			var kRecordChild = kList.kRecordChild[j];

			kRecordChild.iRecordID = dataParser.readDWord();
			kRecordChild.iRecordChildID = dataParser.readDWord();
			kRecordChild.kScoreSize = dataParser.readDWord();
			kRecordChild.kScore = dataParser.readIntArray(kRecordChild.kScoreSize);

			// NNGameRecord
			kRecordChild.kNNGameRecord = {};
			var kNNGameRecord = kRecordChild.kNNGameRecord;
			kNNGameRecord.kDataSize = dataParser.readDWord();
			kNNGameRecord.kPlayersSize = dataParser.readDWord();
			kNNGameRecord.kPlayers = [];
			for (var k = 0; k < kNNGameRecord.kPlayersSize; ++k) {
				var offset = dataParser.getOffset();
				if (offset >= dataByteLen)
					break;

				kNNGameRecord.kPlayers[k] = {};
				var kPlayer = kNNGameRecord.kPlayers[k];
				kPlayer.dwUserID = dataParser.readDWord();
				kPlayer.kHead = dataParser.readCharArray(dataParser.readDWord());
				kPlayer.kNickName = dataParser.readCharArray(dataParser.readDWord());
				kPlayer.cbCardData = dataParser.readByteArray(dataParser.readDWord());
			}

			kNNGameRecord.kActionSize = dataParser.readDWord();
			kNNGameRecord.kAction = [];
			for (var k = 0; k < kNNGameRecord.kActionSize; ++k) {
				var offset = dataParser.getOffset();
				if (offset >= dataByteLen)
					break;

				kNNGameRecord.kAction[k] = {};
				var kAction = kNNGameRecord.kAction[k];
				kAction.cbActionType = dataParser.readByte();
				kAction.bOx = dataParser.readByte();
				kAction.lUserID = dataParser.readDWordArray(dataParser.readDWord());

				kAction.lGameScoreSize = dataParser.readDWord();
				kAction.lGameScore = [];
				for (var m = 0; m < kAction.lGameScoreSize; ++m) {
					var offset = dataParser.getOffset();
					if (offset >= dataByteLen)
						break;

					kAction.lGameScore[m] = {};
					var lGameScore = kAction.lGameScore[m];
					lGameScore.UserID = dataParser.readDWord();
					lGameScore.GameScore = dataParser.readInt64Number();
				}
			}
				
			kNNGameRecord.dwKindID = dataParser.readDWord();
			kNNGameRecord.dwVersion = dataParser.readDWord();

			// others
			var kPlayTime = dataParser.parse([["kPlayTime", "SYSTEMTIME"]]);
			kRecordChild.kPlayTime = kPlayTime.kPlayTime;
			kRecordChild.kUserDefine = dataParser.readCharArray(dataParser.readDWord());
			kRecordChild.dwKindID = dataParser.readDWord();
			kRecordChild.dwVersion = dataParser.readDWord();
		}

		// others
		kList.iRecordID = dataParser.readDWord();
		kList.kUserDefine = dataParser.readCharArray(dataParser.readDWord());
		kList.dwKindID = dataParser.readDWord();
		kList.dwVersion = dataParser.readDWord();
		
		cc.log("查询游戏记录全部内容[onSubGameRecordTotal]:" + JSON.stringify(kList));
		cc.NetMgr.onLogonQueryGameRecordTotalResult(kList);
	},

	// 查询游戏记录子内容
	onSubGameRecordChild: function(data){
		cc.log("查询游戏记录子内容[onSubGameRecordChild]");
	},

	// 查询已在游戏服
	onSubQueryIngameServerId: function(data){
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["LockKindID", "DWORD"],
			["LockServerID", "DWORD"],
		]);
		
		cc.log("查询已在游戏服[onSubQueryIngameServerId]:" + JSON.stringify(parseData));

		var player = cc.PlayerMgr.getPlayer(cc.UserServiceMsg.getOperateData());
		if (player) {
			player.ingameServerId = parseData.LockServerID;
			cc.NetMgr.onGameQueryIngameServerIdResult(player);
		}
	},
});

UserServiceMsg.getInstance = function(){
	if(g_userServiceMsg == null){
		g_userServiceMsg = new UserServiceMsg();
	}
	return g_userServiceMsg;
}
module.exports = UserServiceMsg;