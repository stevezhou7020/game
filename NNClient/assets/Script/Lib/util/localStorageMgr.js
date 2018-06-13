
var g_localStorageMgr = null;
var LocalStorage_Key = {
	UUID_KEY: "_uuid_",					// 玩家uuid，当机器码用
	VISITOR_LOGIN: "_visitor_login_",
    LOGIN_RECORD_KEY: "_login_record_",	// 玩家登录记录
    RECORD_PASS_KEY: "_record_pass_",
    AUTO_LOGIN_KEY: "_auto_login_",
    MUSIC_KEY: "_music_",				// 背景音乐
    SOUND_KEY: "_sound_",				// 音效
    MUSIC_VOLUME_KEY: "_music_volume_",	// 背景音乐音量
    SOUND_VOLUME_KEY: "_sound_volume_",	// 音效音量
    HALL_MUSIC_KEY: "_hall_music_",		// 大厅背景音乐
    HALL_SOUND_KEY: "_hall_sound_",		// 大厅音效
    GAME_MUSIC_KEY: "_game_music_",		// 游戏背景音乐
    GAME_SOUND_KEY: "_game_sound_",		// 游戏音效
    MAILS_INFO: "_mails_info_"
};

var LocalStorageMgr = cc.Class({
    _locarStorage: null,

    ctor: function () {
        this._locarStorage = cc.sys.localStorage;
    },
    
    //------------------------UUID
    getUuidItem: function () {
    	var strUuid = this._locarStorage.getItem(LocalStorage_Key.UUID_KEY);
    	if (!strUuid || strUuid == "") {
    		strUuid = cc.UUID.genV4().toString();
    		this._locarStorage.setItem(LocalStorage_Key.UUID_KEY, strUuid);
    	}

    	return strUuid;
    },

    //------------------------游客账号密码
    setVisitorLoginItem: function (str) {
    	//加密
    	// str = cc.CryptoUtil.base64_encode(str);
    	this._locarStorage.setItem(LocalStorage_Key.VISITOR_LOGIN, str);
    },

    getVisitorLoginItem: function () {
    	var str = this._locarStorage.getItem(LocalStorage_Key.VISITOR_LOGIN);

    	if (!str || str == "") {
    		str = "[]";
    	}
		else {
    		//解密
    		// str = cc.CryptoUtil.base64_decode(str);
    	}

    	return str;
    },

    removeVisitorLoginItem: function () {
    	this._locarStorage.removeItem(LocalStorage_Key.VISITOR_LOGIN);
    },
    
    //------------------------登录账号密码记录
    setLoginRecordItem: function (str) {
    	//加密
    	// str = cc.CryptoUtil.base64_encode(str);
    	this._locarStorage.setItem(LocalStorage_Key.LOGIN_RECORD_KEY, str);
    },

    getLoginRecordItem: function () {
    	var str = this._locarStorage.getItem(LocalStorage_Key.LOGIN_RECORD_KEY);

    	if (!str || str == "") {
    		str = "[]";
    	}
		else {
    		//解密
    		// str = cc.CryptoUtil.base64_decode(str);
    	}
    	
    	return str;
    },

    removeLoginRecordItem: function () {
        this._locarStorage.removeItem(LocalStorage_Key.LOGIN_RECORD_KEY);
    },

    //------------------------记住密码
    setRecordPassItem: function (bRecord) {
    	var str = "N";
    	if (bRecord) {
    		str = "Y";
    	}
    	
    	this._locarStorage.setItem(LocalStorage_Key.RECORD_PASS_KEY, str);
    },

    getRecordPassItem: function () {
    	var bRecord = true; // 默认true

    	var str = this._locarStorage.getItem(LocalStorage_Key.RECORD_PASS_KEY);
    	if(str == "N"){
    		bRecord = false;
    	}
    	
    	return bRecord;
    },

    removeRecordPassItem: function () {
        this._locarStorage.removeItem(LocalStorage_Key.RECORD_PASS_KEY);
    },

    //------------------------自动登录
    setAutoLoginItem: function (bAuto) {
    	var str = "N";
    	if(bAuto){
    		str = "Y";
    	}
    	
    	this._locarStorage.setItem(LocalStorage_Key.AUTO_LOGIN_KEY, str);
    },

    getAutoLoginItem: function () {
    	var bAuto = true; // 默认true
    	
    	var str = this._locarStorage.getItem(LocalStorage_Key.AUTO_LOGIN_KEY);
    	if(str == "N"){
    		bAuto = false;
    	}

    	return bAuto;
    },

    removeAutoLoginItem: function () {
        this._locarStorage.removeItem(LocalStorage_Key.AUTO_LOGIN_KEY);
    },

    //------------------------music
    setMusicItem: function (bOpen) {
    	var str = "N";
    	if(bOpen){
    		str = "Y";
    	}
    	
    	this._locarStorage.setItem(LocalStorage_Key.MUSIC_KEY, str);
    },

    getMusicItem: function () {
    	var bOpen = true;//默认true
    	
    	var str = this._locarStorage.getItem(LocalStorage_Key.MUSIC_KEY);
    	if(str == "N"){
    		bOpen = false;
    	}

    	return bOpen;
    },

    removeMusicItem: function () {
        this._locarStorage.removeItem(LocalStorage_Key.MUSIC_KEY);
    },

    //------------------------sound
    setSoundItem: function (bOpen) {
    	var str = "N";
    	if (bOpen) {
    		str = "Y";
    	}

    	this._locarStorage.setItem(LocalStorage_Key.SOUND_KEY, str);
    },

    getSoundItem: function () {
    	var bOpen = true; // 默认true

    	var str = this._locarStorage.getItem(LocalStorage_Key.SOUND_KEY);
    	if (str == "N") {
    		bOpen = false;
    	}

    	return bOpen;
    },

    removeSoundItem: function () {
        this._locarStorage.removeItem(LocalStorage_Key.SOUND_KEY);
    },

    //------------------------music volume
    setMusicVolumeItem: function (v) {
    	this._locarStorage.setItem(LocalStorage_Key.MUSIC_VOLUME_KEY, v.toString());
    },

    getMusicVolumeItem: function () {
    	var v = 1.0;

    	var str = this._locarStorage.getItem(LocalStorage_Key.MUSIC_VOLUME_KEY);
        if (str != null) {
            v = parseFloat(str);    
        }

    	if (isNaN(v)) {
    		v = 1.0;
    	}

    	return v;
    },

    removeMusicVolumeItem: function () {
    	this._locarStorage.removeItem(LocalStorage_Key.MUSIC_VOLUME_KEY);
    },
    
    //------------------------sound volume
    setSoundVolumeItem: function (v) {
    	this._locarStorage.setItem(LocalStorage_Key.SOUND_VOLUME_KEY, v.toString());
    },

    getSoundVolumeItem: function () {
    	var v = 1.0;

    	var str = this._locarStorage.getItem(LocalStorage_Key.SOUND_VOLUME_KEY);
        if (str != null) {
            v = parseFloat(str);    
        }

    	if (isNaN(v)) {
    		v = 1.0;
    	}

    	return v;
    },

    removeSoundVolumeItem: function () {
    	this._locarStorage.removeItem(LocalStorage_Key.SOUND_VOLUME_KEY);
    },
    
    //------------------------游戏任务
    setMailsItem: function (str) {
    	// 加密
    	// str = cc.CryptoUtil.base64_encode(str);
    	this._locarStorage.setItem(LocalStorage_Key.MAILS_INFO, str);
    },

    getMailsItem: function () {
    	var str = this._locarStorage.getItem(LocalStorage_Key.MAILS_INFO);

    	if (!str || str == "") {
    		str = "[]";
    	}
		else {
    		//解密
    		// str = cc.CryptoUtil.base64_decode(str);
    	}

    	return str;
    },

    removeMailsItem: function () {
    	this._locarStorage.removeItem(LocalStorage_Key.MAILS_INFO);
    },
});

LocalStorageMgr.getInstance = function () {
    if (!g_localStorageMgr) {
        g_localStorageMgr = new LocalStorageMgr();
    }
    return g_localStorageMgr;
};
module.exports = LocalStorageMgr;
