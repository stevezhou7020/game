
///////////////////////////////////////////////////////////////////////////
//登录命令
var MDM_GR_LOGON                    = 1;    //登录信息

//登录模式
var SUB_GR_LOGON_USERID             = 1;    //I D 登录
var SUB_GR_LOGON_MOBILE             = 2;    //手机登录
var SUB_GR_LOGON_ACCOUNTS           = 3;    //帐户登录

//登录结果
var SUB_GR_LOGON_SUCCESS            = 100;  //登录成功
var SUB_GR_LOGON_FAILURE            = 101;  //登录失败
var SUB_GR_LOGON_FINISH             = 102;  //登录完成
//登录命令
///////////////////////////////////////////////////////////////////////////


//升级提示
var SUB_GR_UPDATE_NOTIFY            = 200;  //升级提示


///////////////////////////////////////////////////////////////////////////
//配置命令
var MDM_GR_CONFIG                   = 2;    //配置信息

var SUB_GR_CONFIG_COLUMN            = 100;  //列表配置
var SUB_GR_CONFIG_SERVER            = 101;  //房间配置
var SUB_GR_CONFIG_PROPERTY          = 102;  //道具配置
var SUB_GR_CONFIG_FINISH            = 103;  //配置完成
var SUB_GR_CONFIG_USER_RIGHT        = 104;  //玩家权限
//配置命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//用户命令
var MDM_GR_USER = 3;					    //用户信息

//用户动作
var SUB_GR_USER_RULE 				= 1;	//用户规则
var	SUB_GR_USER_LOOKON 				= 2;	//旁观请求
var	SUB_GR_USER_SITDOWN 			= 3;	//坐下请求
var	SUB_GR_USER_STANDUP 			= 4;	//起立请求
var SUB_GR_USER_INVITE 				= 5;	//用户邀请
var SUB_GR_USER_INVITE_REQ 			= 6;	//邀请请求
var SUB_GR_USER_REPULSE_SIT 		= 7;	//拒绝玩家坐下
var SUB_GR_USER_KICK_USER 			= 8;	//踢出用户
var SUB_GR_USER_INFO_REQ 			= 9;	//请求用户信息
var SUB_GR_USER_CHAIR_REQ 			= 10;	//请求更换位置
var SUB_GR_USER_CHAIR_INFO_REQ 		= 11;	//请求椅子用户信息

//用户状态
var	SUB_GR_USER_ENTER 				= 100;	//用户进入
var	SUB_GR_USER_SCORE 				= 101;	//用户分数
var SUB_GR_USER_STATUS 				= 102;	//用户状态
var	SUB_GR_REQUEST_FAILURE 			= 103;	//请求失败

//聊天命令
var	SUB_GR_USER_CHAT 				= 201;	//聊天信息
var	SUB_GR_USER_EXPRESSION 			= 202;	//表情消息
var SUB_GR_WISPER_CHAT 				= 203;	//私聊消息
var	SUB_GR_WISPER_EXPRESSION 		= 204;	//私聊表情
var SUB_GR_COLLOQUY_CHAT 			= 205;	//会话消息
var	SUB_GR_COLLOQUY_EXPRESSION 		= 206;	//会话表情

//道具命令
var SUB_GR_PROPERTY_BUY 			= 300;	//购买道具
var SUB_GR_PROPERTY_SUCCESS 		= 301;	//道具成功
var SUB_GR_PROPERTY_FAILURE 		= 302;	//道具失败
var SUB_GR_PROPERTY_MESSAGE 		= 303;	//道具消息
var SUB_GR_PROPERTY_EFFECT 			= 304;	//道具效应
var SUB_GR_PROPERTY_TRUMPET 		= 305;	//用户喇叭
//用户命令
///////////////////////////////////////////////////////////////////////////


//规则标志
var UR_LIMIT_SAME_IP				= 0x01;	//限制地址
var UR_LIMIT_WIN_RATE				= 0x02;	//限制胜率
var UR_LIMIT_FLEE_RATE				= 0x04;	//限制逃率
var UR_LIMIT_GAME_SCORE				= 0x08;	//限制积分


///////////////////////////////////////////////////////////////////////////
//状态命令
var MDM_GR_STATUS 					= 4;	//状态信息

var SUB_GR_TABLE_INFO 				= 100;	//桌子信息
var	SUB_GR_TABLE_STATUS 			= 101;	//桌子状态
//状态命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//银行命令
var MDM_GR_INSURE 					= 5;	//用户信息

//银行命令
var SUB_GR_QUERY_INSURE_INFO 		= 1;	//查询银行
var SUB_GR_SAVE_SCORE_REQUEST 		= 2;	//存款操作
var SUB_GR_TAKE_SCORE_REQUEST 		= 3;	//取款操作
var SUB_GR_TRANSFER_SCORE_REQUEST 	= 4;	//取款操作
var SUB_GR_QUERY_USER_INFO_REQUEST 	= 5;	//查询用户

var SUB_GR_USER_INSURE_INFO 		= 100;	//银行资料
var SUB_GR_USER_INSURE_SUCCESS 		= 101;	//银行成功
var SUB_GR_USER_INSURE_FAILURE 		= 102;	//银行失败
var SUB_GR_USER_TRANSFER_USER_INFO 	= 103;	//用户资料
//银行命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//管理命令
var MDM_GR_MANAGE					= 6;	//管理命令

var SUB_GR_SEND_WARNING				= 1;	//发送警告
var SUB_GR_SEND_MESSAGE				= 2;	//发送消息
var SUB_GR_LOOK_USER_IP				= 3;	//查看地址
var SUB_GR_KILL_USER				= 4;	//踢出用户
var SUB_GR_LIMIT_ACCOUNS			= 5;	//禁用帐户
var SUB_GR_SET_USER_RIGHT			= 6;	//权限设置

//房间设置
var SUB_GR_QUERY_OPTION				= 7;	//查询设置
var SUB_GR_OPTION_SERVER			= 8;	//房间设置
var SUB_GR_OPTION_CURRENT			= 9;	//当前设置

var SUB_GR_LIMIT_USER_CHAT			= 10;   //限制聊天

var SUB_GR_KICK_ALL_USER			= 11;   //踢出用户
var SUB_GR_DISMISSGAME		   		= 12;   //解散游戏
//管理命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//设置标志
var OSF_ROOM_CHAT				    = 1;    //大厅聊天
var OSF_GAME_CHAT				    = 2;    //游戏聊天
var OSF_ROOM_WISPER				    = 3;    //大厅私聊
var OSF_ENTER_TABLE				    = 4;    //进入游戏
var OSF_ENTER_SERVER			    = 5;    //进入房间
var OSF_SEND_BUGLE				    = 12;   //发送喇叭
//设置标志
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//比赛命令
var MDM_GR_MATCH                    = 9;	//比赛命令
var SUB_GR_MATCH_FEE                = 400;  //报名费用
var SUB_GR_MATCH_NUM                = 401;  //等待人数
var SUB_GR_LEAVE_MATCH              = 402;  //退出比赛
var SUB_GR_MATCH_INFO               = 403;  //比赛信息
var SUB_GR_MATCH_WAIT_TIP           = 404;  //等待提示
var SUB_GR_MATCH_RESULT             = 405;  //比赛结果
var SUB_GR_MATCH_STATUS             = 406;  //比赛状态
var SUB_GR_MATCH_GOLDUPDATE         = 409;  //金币更新
var SUB_GR_MATCH_ELIMINATE          = 410;  //比赛淘汰
var SUB_GR_MATCH_JOIN_RESOULT       = 411;  //加入结果

////////////////改动以下时 请将游戏里面CMD_GAME.H的同时改动///////////////////
// var SUB_GR_MATCH_INFO_ER_SPARROWS = 410; //比赛信息(2人麻将)
//比赛命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//私人场命令
var MDM_GR_PRIVATE			        = 10;   //私人场命令

var SUB_GR_PRIVATE_INFO				= 401;  //私人场信息
var SUB_GR_CREATE_PRIVATE			= 402;  //创建私人场
var SUB_GR_CREATE_PRIVATE_SUCESS	= 403;  //创建私人场成功
var SUB_GR_JOIN_PRIVATE				= 404;  //加入私人场
var SUB_GF_PRIVATE_ROOM_INFO		= 405;  //私人场房间信息
var SUB_GR_PRIVATE_DISMISS			= 406;  //私人场请求解散
var SUB_GR_PRIVATE_OUT		        = 410;  //私人场请求强制结束
var SUB_GF_PRIVATE_END				= 407;  //私人场结算
var SUB_GR_RIVATE_AGAIN				= 408;  //重新创建私人场
var SUB_GR_EXIT_SAVE				= 409;  //离开但保存
var SUB_GR_SITDOWN_PRIVATE          = 411;  //用户坐下---new server
var SUB_GR_PRIVATE_DISMISS_FAIL     =412;   //请求解散房间失败
var SUB_GR_PRIVATE_DISMISS_REQUIRE  =413;   //用户请求解散房间 需要玩家确认
var SUB_GR_PRIVATE_ROOMLISTBYCREATOR=414;   //用户请求房间列表

//私人场命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//框架命令
var	MDM_GF_FRAME                    = 100;  //框架命令

//用户命令
var SUB_GF_GAME_OPTION 			    = 1;    //游戏配置
var SUB_GF_USER_READY 			    = 2;    //用户准备
var SUB_GF_LOOKON_CONFIG 		    = 3;    //旁观配置

//聊天命令
var SUB_GF_USER_CHAT 			    = 10;   //用户聊天
var SUB_GF_USER_EXPRESSION 		    = 11;   //用户表情
var SUB_GR_TABLE_TALK			    = 12;   //用户聊天

//游戏信息
var SUB_GF_GAME_STATUS 			    = 100;  //游戏状态
var SUB_GF_GAME_SCENE 			    = 101;  //游戏场景
var SUB_GF_LOOKON_STATUS 		    = 102;  //旁观状态

//系统消息
var SUB_GF_SYSTEM_MESSAGE 		    = 200;  //系统消息
var SUB_GF_ACTION_MESSAGE 		    = 201;  //动作消息
//框架命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//游戏命令
var MDM_GF_GAME = 200;					    //游戏命令
//游戏命令  子命令 --> 各个游戏分别定义
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//其他信息
var DTP_GR_TABLE_PASSWORD 	        = 1;    //桌子密码

//用户属性
var DTP_GR_NICK_NAME 		        = 10;   //用户昵称
var DTP_GR_GROUP_NAME 		        = 11;   //社团名字
var DTP_GR_UNDER_WRITE 		        = 12;   //个性签名

//附加信息
var DTP_GR_USER_NOTE 		        = 20;   //用户备注
var DTP_GR_CUSTOM_FACE 		        = 21;   //自定头像
//其他信息
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//请求错误
var REQUEST_FAILURE_NORMAL		    = 0;    //常规原因
var REQUEST_FAILURE_NOGOLD		    = 1;    //金币不足
var REQUEST_FAILURE_NOSCORE		    = 2;    //积分不足
var REQUEST_FAILURE_PASSWORD	    = 3;    //密码错误
//请求错误
///////////////////////////////////////////////////////////////////////////

