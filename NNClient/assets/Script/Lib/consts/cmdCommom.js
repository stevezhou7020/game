
//系统命令
var MDM_CM_SYSTEM = 1000;           //系统命令
var SUB_CM_SYSTEM_MESSAGE = 1;	    //系统消息
var SUB_CM_ACTION_MESSAGE = 2;	    //动作消息
var SUB_CM_DOWN_LOAD_MODULE = 3;    //下载消息

//类型掩码
var SMT_CHAT 		= 0x0001;	    //聊天消息
var SMT_EJECT 		= 0x0002;	    //弹出消息
var SMT_GLOBAL 		= 0x0004;	    //全局消息
var SMT_PROMPT 		= 0x0008;	    //提示消息
var SMT_TABLE_ROLL 	= 0x0010;	    //滚动消息

//控制掩码
var SMT_CLOSE_ROOM 	= 0x0100;	    //关闭房间
var SMT_CLOSE_GAME 	= 0x0200;	    //关闭游戏
var SMT_CLOSE_LINK 	= 0x0400;	    //中断连接