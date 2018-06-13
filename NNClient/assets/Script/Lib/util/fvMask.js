
// Created by steve on 2017/4/19.

var g_fvMask = null;
var FvMask = cc.Class({
    ctor:function(){},

    hasAny:function(flag, mask) {
        mask = (0X01 << (mask));
        return ((flag&mask)!=0);
    },
    hasAll:function(flag, mask) {
        mask = (0X01 << (mask));
        return ((flag&mask) == mask);
    },
    add:function(flag, mask) {
        mask = (0X01 << (mask));
        flag |= mask;
        return flag;
    },
    del:function(flag, mask) {
        mask = (0X01 << (mask));
        flag &= ~mask;
        return flag;
    },
    remove:function(flag, mask) {
        mask = (0X01 << (mask));
        return (flag & (~mask));
    },
    isAdd:function(oldFlag, newFlag, mask) {
        mask = (0X01 << (mask));
        return (((oldFlag&mask) == 0) && ((newFlag&mask) != 0));
    },
    isDel:function(oldFlag, newFlag, mask) {
        mask = (0X01 << (mask));
        return (((oldFlag&mask) != 0) && ((newFlag&mask) == 0));
    },
});

FvMask.getInstance = function(){
    if(g_fvMask == null){
        g_fvMask = new FvMask();
    }
    return g_fvMask;
}
module.exports = FvMask;
