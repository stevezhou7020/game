cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {

    },

    onBtnAnyWhereClicked: function() {
        this.node.active = false;
    },

     onBtnLiWuClicked: function(event) {
        var btn = event._currentTarget;
        var liwuid = btn.liwuid;
        var player = btn.userData;
        
        if (liwuid && player && player.userInfo && player.userInfo.dwUserID) {
            cc.GameUserMsg.sendUserExpression(liwuid, player.userInfo.dwUserID);
        }
    },

    onBtnYuYinClicked: function(event) {
        var btn = event._currentTarget;
        var player = btn.userData;
        
        if (player && player.yuyinId) {
            cc.AudioMgr.playWAV(player.yuyinId, true);
        }
    }
});
