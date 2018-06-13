
var g_loginRegisterMsg = null;
var LoginRegisterMsg = cc.Class({
	ctor: function () {},

	//---------------------------------------------------------------------------------
	// 发送登录消息
	sendLogon: function (account, password) {
		var machineId = cc.LocalStorageMgr.getUuidItem();

		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(256);
		dataBuilder.build([
			//系统信息
			["dwPlazaVersion", "DWORD", VERSION_PLAZA],									//广场版本
			["szMachineID", "CHARS", machineId, LEN_MACHINE_ID],						//机器序列
			//登录信息
			["szPassword", "CHARS", password, LEN_PASSWORD],							//登录密码
			["szAccounts", "CHARS", account, LEN_ACCOUNTS],								//登录帐号
			["cbValidateFlags", "DWORD", MB_VALIDATE_FLAGS | LOW_VER_VALIDATE_FLAGS],	//校验标识
		]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 登录服:登录[sendLogon]");
			cc.LogonSocket.sendData(MDM_GP_LOGON, SUB_GP_LOGON_ACCOUNTS, dataBuilder.getData());
		}
	},	

	// 发送注册消息
	sendRegister: function (account, password, szNickName, cbGender) {
		var machineId = cc.LocalStorageMgr.getUuidItem();
		var passPortId = "passPortId";
		var compellation = "compellation";

		var dataBuilder = new cc.DataBuilder();
		dataBuilder.init(256);
		dataBuilder.build([
			//系统信息
			["dwPlazaVersion", "DWORD", VERSION_PLAZA],									//广场版本
			["szMachineID", "CHARS", machineId, LEN_MACHINE_ID],						//机器序列			
			//密码变量
			["szLogonPass", "CHARS", password, LEN_PASSWORD],							//登录密码
			["szInsurePass", "CHARS", password, LEN_PASSWORD],							//银行密码
			//注册信息
			["wFaceID", "WORD", 0],														//头像标识
			["cbGender", "BYTE", cbGender],												//用户性别
			["szAccounts", "CHARS", account, LEN_ACCOUNTS],								//登录帐号
			["szNickName", "CHARS", szNickName, LEN_NICKNAME],							//用户昵称
			["szSpreader", "CHARS", "", LEN_ACCOUNTS],									//推荐帐号
			["szPassPortID", "CHARS", passPortId, LEN_PASS_PORT_ID],					//证件号码
			["szCompellation", "CHARS", compellation, LEN_COMPELLATION],				//真实姓名
			["cbValidateFlags", "DWORD", MB_VALIDATE_FLAGS | LOW_VER_VALIDATE_FLAGS],	//校验标识
		]);

		if (cc.LogonSocket.status == SOCKET_STATUS.SS_CONNECTED) {
			cc.log("-> 登录服:注册[sendLogon]");
			cc.LogonSocket.sendData(MDM_GP_LOGON, SUB_GP_REGISTER_ACCOUNTS, dataBuilder.getData());
		}
	},

	//---------------------------------------------------------------------------------
	// 响应登录消息
	onMainLogon: function (subCmd, data) {
		switch (subCmd) {
			//登录成功
			case SUB_GP_LOGON_SUCCESS:
				cc.LoginRegisterMsg.onSubLogonSuccess(data);
				break;
			//登录失败
			case SUB_GP_LOGON_FAILURE:
				cc.LoginRegisterMsg.onSubLogonFailure(data);
				break;
			//登录完成
			case SUB_GP_LOGON_FINISH:
				cc.LoginRegisterMsg.onSubLogonFinish(data);
				break;
			default:
				break;
		}
	},

    // 登录成功
	onSubLogonSuccess: function (data) {
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
			["cbInsureEnabled", "BYTE"], 												//银行开通
			//用户成绩
			["lScore", "SCORE"], 														//用户金币
			["lInsure", "SCORE"], 														//用户银行
			//用户信息
			["cbGender", "BYTE"], 														//用户性别
			["cbMoorMachine", "BYTE"], 													//锁定机器
			["szAccounts", "CHARS", LEN_ACCOUNTS],										//登录帐号
			["szNickName", "CHARS", LEN_NICKNAME],										//用户昵称
			["szGroupName", "CHARS", LEN_GROUP_NAME],									//社团名字	
			//配置信息
			["cbShowServerStatus", "BYTE"], 											//显示服务器状态
		]);
		
		cc.log("登录服:登录成功[onSubLogonSuccess]:" + JSON.stringify(parseData));

		cc.PlayerMgr.setLocalPlayerId(parseData.dwUserID);	
		cc.NetMgr.onLogonLogonResult(true, parseData);
	},

	// 登录失败
	onSubLogonFailure: function (data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["lResultCode", "DWORD"],													//错误代码
			["szDescribeString", "CHARS", 128],											//描述消息
		]);

		cc.PlayerMgr.setLocalPlayerId(0);

		cc.log("登录服:登录失败[onSubLogonFailure]:" + JSON.stringify(parseData));
		cc.NetMgr.onLogonLogonResult(false, parseData);
	},

	// 登录完成
	onSubLogonFinish: function (data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			["wIntermitTime", "WORD"], 													//中断时间	
			["wOnLineCountTime", "WORD"], 												//更新时间	
		]);
		cc.log("登录服:登录完成[onSubLogonFinish]:" + JSON.stringify(parseData));
		cc.NetMgr.onLogonLogonFinish(parseData);
	},
});

LoginRegisterMsg.getInstance = function () {
	if (g_loginRegisterMsg == null) {
		g_loginRegisterMsg = new LoginRegisterMsg();
	}
	return g_loginRegisterMsg;
}
module.exports = LoginRegisterMsg;