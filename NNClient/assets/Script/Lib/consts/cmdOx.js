
// Created by steve on 2017/4/19.

//////////////////////////////////////////////////////////////////////////
// 游戏规则  修改时候 相应的子游戏服务需要修改，还有框架需要修改 牛牛游戏 用户动态加入 房卡消费方式
var GAME_RULE_SUIJIZHUANG		    = 1;  //随机庄
var GAME_RULE_QIANGZHUANG		    = 2;  //抢庄
var GAME_RULE_WIN_ZHUANG            = 3;  //赢家坐庄
var GAME_RULE_NOT_WAITE			    = 4;  //等待用户响应
var GAME_RULE_TYPE_NIUNIU			= 5;  //牛牛游戏
var GAME_RULE_TYPE_TONGBINIUNIU		= 6;  //通比牛牛游戏
var GAME_RULE_TYPE_ZHUANZHUANNIUNIU	= 7;  //转转牛牛游戏
var GAME_RULE_ROOM_COST_TYPE        = 8;  //房卡消费方式 添加就是 AA
var GAME_RULE_DYNAMIC_JOIN          = 9;  //用户动态加入 添加就是动态加入
var GAME_RULE_PLAYSCORE_TIEMS_1     = 10; //类型（1）/翻倍规则
var GAME_RULE_PLAYSCORE_TIEMS_2     = 11; //类型（2）/翻倍规则
var GAME_RULE_GAMEPLAER_4           = 12; //四个玩家 一庄三闲二人扎鸟
var GAME_RULE_GAMEPLAER_6           = 13;
var GAME_RULE_BASESCORE_1		    = 14; //游戏初始底分
var GAME_RULE_BASESCORE_2		    = 15;
var GAME_RULE_BASESCORE_3		    = 16;

// 常量
var GAME_KIND_ID				    = 29;                   //游戏类型ID
var GAME_NAME						= '霸王牛牛';            //游戏名字
var PLAYER_COUNT					= 6;		            //最大人数
var CARD_COUNT						= 5;		            //最大张数
var SERVER_NAME_LEN				    = 32;                   //服务器名长度

// 类型
var GAME_TYPE_PRIVATE               = 0;
var GAME_TYPE_PUBLIC                = 1;

// 游戏状态
var GAME_STATUS_FREE                = 0;				    //空闲状态
var GAME_STATUS_PLAY                = 100;				    //游戏状态
var GAME_STATUS_WAIT                = 200;				    //等待状态
var GAME_STATUS_FINISH              = 50;                   //强行结束状态

var GS_TK_FREE						= GAME_STATUS_FREE;     //等待开始
var GS_TK_FINISH                    = GAME_STATUS_FINISH;   //强行结束状态
var GS_TK_CALL						= GAME_STATUS_PLAY;	    //叫庄状态
var GS_TK_SCORE						= GAME_STATUS_PLAY+1;   //下注状态
var GS_TK_PLAYING					= GAME_STATUS_PLAY+2;   //游戏进行

// 扑克类型
var OX_VALUE0		                = 0;				    //混合牌型
var OX_FIVESMALL	                = 103;				    //五小牛
var OX_FIVEBIG	                    = 104;				    //全大
var OX_FIVEKING	                    = 105;			        //五花牛
var OX_FOUR_SAME	                = 106;			        //炸弹

// 回放动作类型
var ACTION_TYPE_NULL                = 0;
var ACTION_TYPE_PickZhuang          = 1;
var ACTION_TYPE_OutCard             = 2;
var ACTION_TYPE_Score               = 3;

//////////////////////////////////////////////////////////////////////////
// 服务器命令
var SUB_S_GAME_START                = 100;				    //游戏开始
var SUB_S_ADD_SCORE                 = 101;				    //加注结果
var SUB_S_PLAYER_EXIT               = 102;				    //用户强退
var SUB_S_SEND_CARD                 = 103;				    //发牌消息
var SUB_S_GAME_END                  = 104;			        //游戏结束
var SUB_S_OPEN_CARD                 = 105;				    //用户摊牌
var SUB_S_CALL_BANKER               = 106;				    //用户叫庄
var SUB_S_ALL_CARD                  = 107;				    //发牌消息
var SUB_S_AMDIN_COMMAND             = 108;				    //系统控制


//////////////////////////////////////////////////////////////////////////
// 客户端命令
var SUB_C_CALL_BANKER				= 1;				    //用户叫庄
var SUB_C_ADD_SCORE					= 2;				    //用户加注
var SUB_C_OPEN_CARD					= 3;				    //用户摊牌
var SUB_C_SPECIAL_CLIENT_REPORT     = 4;                    //特殊终端
var SUB_C_ADDSCORE_ZANIAO           = 6;                    //用户扎鸟

// 管理员命令
var SUB_C_AMDIN_COMMAND			    = 5;
var SUB_C_MASTER_CHEAKCARD		    = 7;
var RQ_OPTION_CANCLE		        = 1;                    //取消
var RQ_OPTION_QUERYING		        = 2;                    //查询
var RQ_OPTION_SETING		        = 3;                    //设置


//////////////////////////////////////////////////////////////////////////
// 用户礼物表情
var LIWU_SHIT                       = 1;                    //屎
var LIWU_HUA                        = 2;                    //花
var LIWU_CHUN                       = 3;                    //唇
var LIWU_XIE                        = 4;                    //鞋子

// 常用语、表情、短语音
var SENTENCE = [
    "大家好，很高兴见到各位",
    "不好意思，我有事要先走一步",
    "快下注，买好离手",
    "快点亮牌哦",
    "你太牛哒",
    "你屋里是开银行的吧",
    "哈哈，手气真好",
    "手气不好，去冲下喜哒",
    "财神爷我滴爷，通杀这把，明天买鸡给你们吃",
];
var SENTENCE_TEXT_BASE              = 100;                  // 常用语起始ID
var EXPRESSION_BASE                 = 200;                  // 表情起始ID

