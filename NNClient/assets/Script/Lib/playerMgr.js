
// 玩家管理器
//      服务器在客户端的玩家数据完整副本, 以便于访问与统一管理
// 包括
//		帐号信息客户端数据副本, 完全对应服务端 DBO_GP_UserAccountInfo 结构, 使用点号直接访问成员, 如 accountInfo.dwUserID
//		个人资料客户端数据副本, 完全对应服务端 CMD_GP_UserIndividual+DBO_GP_UserIndividual 结构, 同上
//		游戏房间内用户信息客户端数据副本, 完全对应服务端 tagUserInfoHead 结构, 同上

var Player = cc.Class({
	properties: {
		// 已在游戏服ID
		ingameServerId: 0,
		// 帐号信息
		accountInfo: null,
		// 个人资料
		individualInfo: null,
		// 房间内用户信息
		userInfo: null,
	},
});

var g_playerMgr = null;
var PlayerMgr = cc.Class({
	ctor: function(){},

	properties: {
		// 本地玩家 Id
		localPlayerId: 0,

		// 玩家列表
		players: {
            default: {},
            visible: false,
        },
	},

	setLocalPlayerId: function(dwUserID) {
		cc.PlayerMgr.localPlayerId = dwUserID;
	},
	
	getLocalPlayerId: function() {
		return cc.PlayerMgr.localPlayerId;
	},

	getPlayers: function() {
		return cc.PlayerMgr.players;
	},

	getPlayer: function(dwUserID) {
		if (!dwUserID || dwUserID == 0) {
			dwUserID = cc.PlayerMgr.localPlayerId;
		}

		if (dwUserID == 0) {
			return null;
		}
		
		if (!cc.PlayerMgr.players[dwUserID] || cc.PlayerMgr.players[dwUserID] == null) {
			cc.PlayerMgr.players[dwUserID] = new Player();
		}
		return cc.PlayerMgr.players[dwUserID];
	},

	getPlayerByChairID: function(wChairID) {
		for (var key in cc.PlayerMgr.players) {
			if (key) {
				var player = cc.PlayerMgr.players[key];
				if (player && player.userInfo && player.userInfo.wChairID == wChairID)
					return player;
			}
		}
		return null;
	},
});

PlayerMgr.getInstance = function(){
	if(g_playerMgr == null){
		g_playerMgr = new PlayerMgr();
	}
	return g_playerMgr;
}
module.exports = {
	Player,
	PlayerMgr
}