
// 资源管理器
//      动态加入的资源需要在此管理, 资源须位于 resources 目录下

var g_resourceMgr = null;
var ResourceMgr = cc.Class({
	ctor: function(){},

	properties: {
		// icons
		icons: [],

		// cards
		cards: [],
		
        // 数字
        shuzi: [],
	
        // 礼物
        liwu:[],

        // 表情
        biaoqing:[],
	
		// 推注用的分数
		fenshuNumber: [],
		niuniuNumber: [],

        // 闹钟用的数字
        clockNumber: [],

        // 预制资源
        prefab: [],
	},

	load: function() {
        cc.loader.loadResDir("icon", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.icons[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("card", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.cards[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("shuzi", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.shuzi[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("fenshuNumber", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.fenshuNumber[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("niuniuNumber", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.niuniuNumber[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("clockNumber", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.clockNumber[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("liwu", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.liwu[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("biaoqing", cc.SpriteFrame, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var spriteFrame = assets[i];
                cc.ResourceMgr.biaoqing[spriteFrame.name] = spriteFrame;
            }
        });

        cc.loader.loadResDir("prefab", cc.Prefab, function (err, assets) {
            for (var i = 0; i < assets.length; i++) {
                var prefab = assets[i];
                cc.ResourceMgr.prefab[prefab.name] = prefab;
            }
        });
	}
});

ResourceMgr.getInstance = function(){
	if(g_resourceMgr == null){
		g_resourceMgr = new ResourceMgr();
	}
	return g_resourceMgr;
}
module.exports = ResourceMgr;