
// ip/port
// cc.LogonIp = "192.168.0.188";
cc.LogonIp = "192.168.0.150";
// cc.LogonIp = "127.0.0.1";
// cc.LogonIp = "192.168.0.3";
// cc.LogonIp = "112.74.60.45";
cc.LogonPort = 8300;

// utils
cc.UUID = require("uuid");
cc.MyUtil = require("myUtil");
cc.LocalStorageMgr = require("localStorageMgr").getInstance();
cc.AudioMgr = require("audioMgr").getInstance();
cc.FvMask = require("fvMask").getInstance();

// network
cc.MsgMgr = require("msgMgr").MsgMgr.getInstance();
cc.DataBuilder = require("msgMgr").DataBuilder;
cc.DataParser = require("msgMgr").DataParser;
cc.HttpRequest = require("httpRequest").getInstance();

// network/logonServer
cc.LoginRegisterMsg = require("loginRegisterMsg").getInstance();
cc.LogonMsgHandler = require("logonMsgHandler").getInstance();
cc.ServerListMsg = require("serverListMsg").getInstance();
cc.UserServiceMsg = require("userServiceMsg").getInstance();

// network/gameServer
cc.GameLogonMsg = require("gameLogonMsg").getInstance();
cc.GameMsgHandler = require("gameMsgHandler").getInstance();
cc.GameConfigMsg = require("gameConfigMsg").getInstance();
cc.GameFrameMsg = require("gameFrameMsg").getInstance();
cc.GameUserMsg = require("gameUserMsg").getInstance();
cc.GamePrivateMsg = require("gamePrivateMsg").getInstance();

// Others
cc.GameMgr = require("gameMgr").getInstance();
cc.PlayerMgr = require("playerMgr").PlayerMgr.getInstance();
cc.ResourceMgr = require("resourceMgr").getInstance();
cc.NetMgr = require("netMgr").getInstance();
cc.OxGameLogic = require("oxGameLogic").getInstance();

// 全局变量
cc.LoginInfo = {};  // 登录帐号、密码
cc.RoomInfo = {};   // 私人场房间创建成功后服务器会下发房间的详细信息
cc.ZhuangJia = -1;  // 上一局庄家
cc.TuiZhuMax = 2;   // 上一局推注的最大数值
cc.CardAll = [];    // 服务器下发的桌面上所有的牌
cc.OxAll = [];      // 服务器下发的各玩家自己开牌时提交的有无牛标识
cc.ShenQingUserID = 0; // 记录申请解散房间ID
cc.Zhaniao = [0,0,0];  // 记录扎鸟用户数据

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.Login = this;
        cc.LoginInfo = {};

        cc.ResourceMgr.load();
        cc.AudioMgr.playBGM(null);
    },

    // called every frame
    update: function (dt) {
        cc.NetMgr.update(dt);
    },

    onBtnWeixinClicked: function() {
        cc.NetMgr.connect();
    },
});
