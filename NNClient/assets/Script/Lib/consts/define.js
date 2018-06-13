
//资料数据
var LEN_MD5 = 33;									                 //加密密码
var LEN_USERNOTE = 32;									             //备注长度
var LEN_ACCOUNTS = 32;									             //帐号长度
var LEN_NICKNAME = 32;									             //昵称长度
var LEN_PASSWORD = 33;									             //密码长度
var LEN_GROUP_NAME = 32;								             //社团名字
var LEN_UNDER_WRITE = 32;								             //个性签名
var LEN_PASSPORT = 20									             //身份证

//数据长度
var LEN_QQ = 12;									                 //Q Q 号码
var LEN_EMAIL = 33;									                 //电子邮件
var LEN_USER_NOTE = 256;									         //用户备注
var LEN_SEAT_PHONE = 33;									         //固定电话
var LEN_MOBILE_PHONE = 12;									         //移动电话
var LEN_PASS_PORT_ID = 19;									         //证件号码
var LEN_COMPELLATION = 16;									         //真实名字
var LEN_DWELLING_PLACE = 128;							             //联系地址

//机器标识
var LEN_NETWORK_ID = 13									             //网卡长度
var LEN_MACHINE_ID = 33									             //序列长度

//无效数值
var INVALID_BYTE = 0xff;			                                 //无效数值
var INVALID_WORD = 0xffff;		                                     //无效数值
var INVALID_DWORD = 0xffffffff;	                                     //无效数值

//参数定义
var INVALID_CHAIR = 0xFFFF;					                         //无效椅子
var INVALID_TABLE = 0xFFFF;					                         //无效桌子
var INVALID_USERID = 0;						                         //无效用户

//游戏模式
var GAME_GENRE_GOLD = 0x0001;					                     //金币类型
var GAME_GENRE_SCORE = 0x0002;					                     //点值类型
var GAME_GENRE_MATCH = 0x0004;					                     //比赛类型
var GAME_GENRE_EDUCATE = 0x0008;					                 //训练类型

//用户状态
var US_NULL = 0x00;					                                  //没有状态
var US_FREE = 0x01;					                                  //站立状态
var US_SIT = 0x02;					                                  //坐下状态
var US_READY = 0x03;					                              //同意状态
var US_LOOKON = 0x04;					                              //旁观状态
var US_PLAYING = 0x05;					                              //游戏状态
var US_OFFLINE = 0x06;					                              //断线状态


//比赛状态
var MS_NULL = 0x00;								                      //没有状态
var MS_SIGNUP = 0x01;								                  //报名状态
var MS_MATCHING = 0x02;								                  //比赛状态
var MS_OUT = 0x03;								                      //淘汰状态

//数据库定义
var DB_ERROR = -1;  								                  //处理失败
var DB_SUCCESS = 0;  									              //处理成功
var DB_NEEDMB = 18; 									              //处理失败

//道具标示
var PT_USE_MARK_DOUBLE_SCORE = 0x0001;								  //双倍积分
var PT_USE_MARK_FOURE_SCORE = 0x0002;								  //四倍积分
var PT_USE_MARK_GUARDKICK_CARD = 0x0010;							  //防踢道具
var PT_USE_MARK_POSSESS = 0x0020;								      //附身道具 

var MAX_PT_MARK = 4;                                                  //标识数目

//有效范围
var VALID_TIME_DOUBLE_SCORE = 3600;                                   //有效时间
var VALID_TIME_FOUR_SCORE = 3600;                                     //有效时间
var VALID_TIME_GUARDKICK_CARD = 3600;                                 //防踢时间
var VALID_TIME_POSSESS = 3600;                                        //附身时间
var VALID_TIME_KICK_BY_MANAGER = 3600;                                //游戏时间 


//设备类型
var DEVICE_TYPE_PC = 0x00;                                            //PC
var DEVICE_TYPE_ANDROID = 0x10;                                       //Android
var DEVICE_TYPE_ITOUCH = 0x20;                                        //iTouch
var DEVICE_TYPE_IPHONE = 0x40;                                        //iPhone
var DEVICE_TYPE_IPAD = 0x80;                                          //iPad

/////////////////////////////////////////////////////////////////////////////////
//手机定义

//视图模式
var VIEW_MODE_ALL = 0x0001;								              //全部可视
var VIEW_MODE_PART = 0x0002;								          //部分可视

//信息模式
var VIEW_INFO_LEVEL_1 = 0x0010;								          //部分信息
var VIEW_INFO_LEVEL_2 = 0x0020;								          //部分信息
var VIEW_INFO_LEVEL_3 = 0x0040;								          //部分信息
var VIEW_INFO_LEVEL_4 = 0x0080;								          //部分信息

//其他配置
var RECVICE_GAME_CHAT = 0x0100;								          //接收聊天
var RECVICE_ROOM_CHAT = 0x0200;								          //接收聊天
var RECVICE_ROOM_WHISPER = 0x0400;								      //接收私聊

//行为标识
var BEHAVIOR_LOGON_NORMAL = 0x0000;                                   //普通登录
var BEHAVIOR_LOGON_IMMEDIATELY = 0x1000;                              //立即登录

/////////////////////////////////////////////////////////////////////////////////
//处理结果
var RESULT_ERROR = -1;  								               //处理错误
var RESULT_SUCCESS = 0;  								               //处理成功
var RESULT_FAIL = 1;  									               //处理失败

/////////////////////////////////////////////////////////////////////////////////
//变化原因
var SCORE_REASON_WRITE = 0;                                            //写分变化
var SCORE_REASON_INSURE = 1;                                           //银行变化
var SCORE_REASON_PROPERTY = 2;                                         //道具变化
var SCORE_REASON_MATCH_FEE = 3;                                        //比赛报名
var SCORE_REASON_MATCH_QUIT = 4;                                       //比赛退赛

/////////////////////////////////////////////////////////////////////////////////

//登录房间失败原因
var LOGON_FAIL_SERVER_INVALIDATION = 200;                              //房间失效

var SOCKET_STATUS = {
	SS_INVALID : 0,		//未连接
	SS_CONNECTING : 1,	//连接中
	SS_CONNECTED : 2,	//已连接
	SS_UNKNOWN : 3,		//未使用
};