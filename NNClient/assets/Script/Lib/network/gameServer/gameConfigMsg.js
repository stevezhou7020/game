
var g_gameConfigMsg = null;
var GameConfigMsg = cc.Class({
	ctor: function() {},
	
	//---------------------------------------------------------------------------------
	// 响应配置消息
	onMainConfig: function(subCmd, data){
		switch (subCmd) {
		//房间配置
		case SUB_GR_CONFIG_SERVER:
			cc.GameConfigMsg.onSubConfigServer(data);
			break;
		//配置完成
		case SUB_GR_CONFIG_FINISH:
			cc.GameConfigMsg.onSubConfigFinish(data);
			break;
		default:
			break;
		}
	},

	// 房间配置
	onSubConfigServer: function(data) {
		var dataParser = new cc.DataParser();
		dataParser.init(data);
		var parseData = dataParser.parse([
			//房间属性
			["wTableCount", "WORD"],													//桌子数目
			["wChairCount", "WORD"],													//椅子数目
			//房间配置
			["wServerType", "WORD"],													//房间类型
			["dwServerRule", "DWORD"],													//房间规则
			]);

		cc.log("房间配置[onSubConfigServer]:" + JSON.stringify(parseData));
	},
	
	// 配置完成
	onSubConfigFinish: function(data) {
		cc.log("房间配置完成[onSubConfigFinish]");
		cc.GameFrameMsg.sendGameOption();
	},
});

GameConfigMsg.getInstance = function(){
	if(g_gameConfigMsg == null){
		g_gameConfigMsg = new GameConfigMsg();
	}
	return g_gameConfigMsg;
};
module.exports = GameConfigMsg;