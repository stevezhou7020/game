
var g_serverListMsg = null;
var ServerListMsg = cc.Class({
	ctor: function(){},

	properties: {
		// 服务器列表
		ServerList: {
            default: {},
            visible: false,
        },
	},

	getServer: function(wKindID) {
		var localPlayer = cc.PlayerMgr.getPlayer(0);
		if (localPlayer && localPlayer.ingameServerId) {
			for (var key in cc.ServerListMsg.ServerList) {
				for (var i = 0; i < cc.ServerListMsg.ServerList[key].length; i++) {
					if (localPlayer.ingameServerId == cc.ServerListMsg.ServerList[key][i].wServerID) {
						var item = cc.ServerListMsg.ServerList[key][i];
						return {"ip":item.szServerAddr, "port":item.wServerPort};
					}
				}
			}
		}

		for (var key in cc.ServerListMsg.ServerList) {
			for (var i = 0; i < cc.ServerListMsg.ServerList[key].length; i++) {
				if (cc.ServerListMsg.ServerList[key][i].wKindID == wKindID && cc.ServerListMsg.ServerList[key][i].wServerID) {
					var item = cc.ServerListMsg.ServerList[key][i];
					return {"ip":item.szServerAddr, "port":item.wServerPort};
				}
			}
		}

		return null;
	},

	//---------------------------------------------------------------------------------
	// 响应服务器列表消息
	onMainServerList: function(subCmd, data) {
		switch (subCmd) {
		//种类列表
		case SUB_GP_LIST_KIND:
			cc.ServerListMsg.onListKind(data);
			break;
		//房间列表
		case SUB_GP_LIST_SERVER:
			cc.ServerListMsg.onListServer(data);
			break;
		//列表完成
		case SUB_GP_LIST_FINISH:
			cc.ServerListMsg.onListFinish(data);
			break;
		default:
			break;
		}
	},

	// 种类列表
	onListKind: function(data) {
		cc.log("游戏服:列表种类[onListKind]");
	},

	// 房间列表
	onListServer: function(data) {
		var len = data.byteLength;
		var count = len / 178;

		var dataParser = new cc.DataParser();
		dataParser.init(data);

		for (var i = 0; i < count; ++i) {
			var item = dataParser.parse([
			                             ["wKindID", "WORD"],							//名称索引
			                             ["wNodeID", "WORD"],							//节点索引
			                             ["wSortID", "WORD"],							//排序索引
			                             ["wServerID", "WORD"],							//房间索引
			                             ["wServerType", "WORD"],						//房间类型
			                             ["wServerPort", "WORD"],						//房间端口
			                             ["lCellScore", "SCORE"],						//单元积分
			                             ["lEnterScore", "SCORE"],						//进入积分
			                             ["dwServerRule", "DWORD"],						//房间规则
			                             ["dwOnLineCount", "DWORD"],					//在线人数
			                             ["dwAndroidCount", "DWORD"],					//机器人数
										 ["dwFullCount", "DWORD"],						//满员人数
										 ["szServerAddr", "CHARS", 32],					//房间地址
			                             ["szServerName", "CHARS", 32],					//房间名称
			                             ]);
			
			// 过滤（积分，比赛）类型
			var strSearch = item.szServerName;
			if (strSearch.search(/体验/) != -1 || strSearch.search(/赛/) != -1 || strSearch.search(/积分/) != -1) {
				continue;
			}

			// 按 kindID 分类
			var key = item.wKindID + "";
			if (!(key in cc.ServerListMsg.ServerList) || cc.ServerListMsg.ServerList[key] == null) {
				cc.ServerListMsg.ServerList[key] = [];
			}

			// 已经存在修改，不存在添加
			var bFind = false;
			for (var j = 0; j < cc.ServerListMsg.ServerList[key].length; j++) {
				if (item.wServerID == cc.ServerListMsg.ServerList[key][j].wServerID) {
					cc.ServerListMsg.ServerList[key][j] = item;
					bFind = true;
					break;
				}
			}
			
			if (!bFind) {
				cc.ServerListMsg.ServerList[key].push(item);
			}
		}
		
		//排序
		for (var key in cc.ServerListMsg.ServerList) {
			cc.ServerListMsg.ServerList[key].sort(function(a, b) {
				return a.wSortID - b.wSortID;
			});
		}

		cc.log("游戏服:列表服务器[onListServer]:" + JSON.stringify(cc.ServerListMsg.ServerList));
	},

	// 列表完成
	onListFinish: function(data) {
		cc.log("游戏服:列表完成[onListFinish]");
	},
});

ServerListMsg.getInstance = function(){
	if(g_serverListMsg == null){
		g_serverListMsg = new ServerListMsg();
	}
	return g_serverListMsg;
}
module.exports = ServerListMsg;