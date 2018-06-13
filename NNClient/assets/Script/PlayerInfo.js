cc.Class({
    extends: cc.Component,

    properties: {
        profilePrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame
    // update: function (dt) {

    // },

    onBtnProfileClicked: function() {
        var player = this.userData;
        if (player && player.accountInfo && player.individualInfo) {
            var profile = cc.instantiate(this.profilePrefab);
            profile.userData = player;

            var icon = profile.getChildByName("touxiang").getComponent(cc.Sprite);
            var xingbieIcon = profile.getChildByName("xingbieIcon").getComponent(cc.Sprite);
            var name = profile.getChildByName("xingbieIcon").getChildByName("xingbie").getComponent(cc.Label);
            var dingwei = profile.getChildByName("dingweiIcon").getChildByName("dingwei").getComponent(cc.Label);
            var ju = profile.getChildByName("juIcon").getChildByName("ju").getComponent(cc.Label);
            var id = profile.getChildByName("idIcon").getChildByName("id").getComponent(cc.Label);
            var ip =  profile.getChildByName("ipIcon").getChildByName("ip").getComponent(cc.Label);
            var haoyou =  profile.getChildByName("haoyouIcon").getChildByName("haoyou").getComponent(cc.Label);
            var liwukuang = profile.getChildByName("liwukuang");
            var yuyinkuang = profile.getChildByName("yuyinkuang");

            if (player.individualInfo && player.individualInfo.szHeadHttp && player.individualInfo.szHeadHttp.length > 0) {
                if (cc.ResourceMgr.icons[player.individualInfo.szHeadHttp])
                        icon.spriteFrame = cc.ResourceMgr.icons[player.individualInfo.szHeadHttp];
                    else {
                        cc.loader.load(player.individualInfo.szHeadHttp, function (err, tex) {
                            if (tex) {
                                var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
                                icon.spriteFrame = spriteFrame;
                                cc.ResourceMgr.icons[player.individualInfo.szHeadHttp] = spriteFrame;
                            }
                        });
                    }
            }

            if (player.accountInfo.cbGender == 1)
                xingbieIcon.spriteFrame = cc.ResourceMgr.icons["nan"];
            else
                xingbieIcon.spriteFrame = cc.ResourceMgr.icons["nv"];

            name.string = player.accountInfo.szNickName ? player.accountInfo.szNickName : "未知";
            dingwei.string = player.individualInfo.szUserGps ? player.individualInfo.szUserGps : "未知";
            ju.string = player.accountInfo.dwExperience ? player.accountInfo.dwExperience : "0";
            id.string = player.accountInfo.dwUserID;
            ip.string = player.individualInfo.szLogonIP ? player.individualInfo.szLogonIP : "127.0.0.1";
            haoyou.string = (player.accountInfo.MemberOverDate && player.accountInfo.MemberOverDate.wYear) ? (player.accountInfo.MemberOverDate.wYear+"/"+player.accountInfo.MemberOverDate.wMonth+"/"+player.accountInfo.MemberOverDate.wDay) : "2017/01/01";
            profile.active = true;

            // 给礼物按钮绑定图片消息
            for (var i = 1; i <= 4; ++i)
            {
                var liwuNum = "liwu" + i;
                var btn = liwukuang.getChildByName(liwuNum).getChildByName("btn");
                switch (i) {
                    case 1:
                        btn.liwuid = LIWU_SHIT;
                        break;
                    case 2:
                        btn.liwuid = LIWU_HUA;
                        break;
                    case 3:
                        btn.liwuid = LIWU_CHUN;
                        break;
                    case 4:
                        btn.liwuid = LIWU_XIE;
                        break;
                    default:
                        btn.liwuid = LIWU_SHIT;
                        break;
                }
                btn.userData = player;
            }
        
            var yuyinbtn = yuyinkuang.getChildByName("yuyin");
            yuyinbtn.userData = player;

            profile.parent = this.node.parent;
        }
    },
});
