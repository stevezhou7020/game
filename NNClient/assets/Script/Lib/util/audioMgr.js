
var g_audioMgr = null;
var AudioMgr = cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume:1.0,
        sfxVolume:1.0,
        
        bgmUrl: "",
        bgmAudioID:-1,

        comAudioInst: null,
    },

    comAudio: function() {
        if (this.comAudioInst == null && ccs.ComAudio != null)
            this.comAudioInst = ccs.ComAudio.create();
        return this.comAudioInst;
    },

    // use this for initialization
    init: function () {
        this.bgmVolume = cc.LocalStorageMgr.getMusicVolumeItem();
        this.sfxVolume = cc.LocalStorageMgr.getSoundVolumeItem(); 
        
        var self = this;
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
            self.comAudio().pauseAllEffects();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
            self.comAudio().resumeAllEffects();
        });
    },

    // called every frame
    // update: function (dt) {
    // },
    
    getUrl: function(url){
        return cc.url.raw("resources/sounds/" + url);
    },
    
    playBGM(url, absolute){
        if (this.bgmUrl != url) {
            this.bgmUrl = url;

            var audioUrl;
            if (absolute)
                audioUrl = url;
            else
                audioUrl = this.getUrl(url);

            if(this.bgmAudioID >= 0){
                cc.audioEngine.stop(this.bgmAudioID);
            }
            this.bgmAudioID = cc.audioEngine.play(audioUrl,true,this.bgmVolume);
        }
    },
    
    playSFX(url, absolute){
        var audioUrl;
        if (absolute)
            audioUrl = url;
        else
            audioUrl = this.getUrl(url);
    
        if(this.sfxVolume > 0){
            var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);    
        }
    },
    
    playWAV(url, absolute){
        var audioUrl;
        if (absolute)
            audioUrl = url;
        else
            audioUrl = this.getUrl(url);

        this.comAudio().setEffectsVolume(this.sfxVolume);
        if(this.sfxVolume > 0){
            var audioId = this.comAudio().playEffect(audioUrl);    
        }
    },
    
    setSFXVolume: function(v){
        var delta = Math.abs(this.sfxVolume - v);
        if (delta >= 0.01) {
            cc.LocalStorageMgr.setSoundVolumeItem(v);
            this.sfxVolume = v;
            this.comAudio().setEffectsVolume(this.sfxVolume);
        }
    },
    
    getSFXVolume: function(){
        return this.sfxVolume;
    },
    
    setBGMVolume: function(v,force){
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
        }
        var delta = Math.abs(this.bgmVolume - v);
        if (delta >= 0.01 || force) {
            cc.LocalStorageMgr.setMusicVolumeItem(v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    },
    
    getBGMVolume: function(){
        return this.bgmVolume;
    },
    
    pauseAll: function(){
        cc.audioEngine.pauseAll();
        this.comAudio().pauseAllEffects();
    },
    
    resumeAll: function(){
        cc.audioEngine.resumeAll();
        this.comAudio().resumeAllEffects();
    }
});

AudioMgr.getInstance = function () {
	if (g_audioMgr == null) {
		g_audioMgr = new AudioMgr();
        g_audioMgr.init();
	}
	return g_audioMgr;
}
module.exports = AudioMgr;