
///////////////////////////////////////////////////////////////////////////
//登录命令
var MDM_GP_LOGON 				= 1;		//广场登录

//登录模式
var SUB_GP_LOGON_GAMEID 		= 1;	    //I D 登录
var SUB_GP_LOGON_ACCOUNTS 		= 2;	    //帐号登录
var SUB_GP_REGISTER_ACCOUNTS 	= 3;	    //注册帐号
var SUB_GP_LOGON_VISITOR		= 5;	    //游客登录

//登录结果
var SUB_GP_LOGON_SUCCESS 		= 100;	    //登录成功
var SUB_GP_LOGON_FAILURE 		= 101;	    //登录失败
var SUB_GP_LOGON_FINISH 		= 102;	    //登录完成
var SUB_GP_VALIDATE_MBCARD 		= 103;	    //登录失败
var SUB_GP_MATCH_SIGNUPINFO		= 106;	    //报名信息
//登录命令
///////////////////////////////////////////////////////////////////////////


//升级提示
var SUB_GR_UPDATE_NOTIFY        = 200;	    //升级提示


///////////////////////////////////////////////////////////////////////////
//列表命令
var MDM_GP_SERVER_LIST 			= 2;	    //列表信息

//获取命令
var SUB_GP_GET_LIST 			= 1;	    //获取列表
var SUB_GP_GET_SERVER 			= 2;	    //获取房间
var SUB_GP_GET_ONLINE 			= 3;	    //获取在线
var SUB_GP_GET_COLLECTION 		= 4;	    //获取收藏

//列表信息
var SUB_GP_LIST_TYPE 			= 100;	    //类型列表
var SUB_GP_LIST_KIND 			= 101;	    //种类列表
var SUB_GP_LIST_NODE 			= 102;	    //节点列表
var SUB_GP_LIST_PAGE 			= 103;	    //定制列表
var SUB_GP_LIST_SERVER 			= 104;	    //房间列表
var SUB_GP_VIDEO_OPTION 		= 105;	    //视频配置

//完成信息
var SUB_GP_LIST_FINISH 			= 200;	    //发送完成
var SUB_GP_SERVER_FINISH 		= 201;	    //房间完成

//在线信息
var SUB_GR_KINE_ONLINE 			= 300;	    //类型在线
var SUB_GR_SERVER_ONLINE 		= 301;	    //房间在线
//列表命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//服务命令
var MDM_GP_USER_SERVICE 		= 3;	    //用户服务

//账号服务
var SUB_GP_MODIFY_MACHINE 		= 100;	    //修改机器
var SUB_GP_MODIFY_LOGON_PASS 	= 101;	    //修改密码
var SUB_GP_MODIFY_INSURE_PASS 	= 102;	    //修改密码
var SUB_GP_MODIFY_UNDER_WRITE 	= 103;	    //修改签名
var SUB_GP_MODIFY_ACCOUNTS		= 104;	    //修改帐号
var SUB_GP_MODIFY_SPREADER		= 105;	    //修改推荐人

//修改头像
var SUB_GP_USER_FACE_INFO 		= 120;	    //头像信息
var SUB_GP_SYSTEM_FACE_INFO 	= 121;	    //系统头像
var SUB_GP_CUSTOM_FACE_INFO 	= 122;	    //自定头像

//个人资料
var SUB_GP_USER_INDIVIDUAL 		= 301;	    //个人资料
var	SUB_GP_QUERY_INDIVIDUAL 	= 302;	    //查询信息
var SUB_GP_MODIFY_INDIVIDUAL 	= 303;	    //修改资料
var	SUB_GP_QUERY_ACCOUNTINFO	= 304;	    //个人信息
var	SUB_GP_QUERY_INGAME_SEVERID	= 305;	    //游戏状态
var	SUB_GP_MODIFY_STARVALUE		= 306;	    //评分

//银行服务
var SUB_GP_USER_SAVE_SCORE 		    = 400;  //存款操作
var SUB_GP_USER_TAKE_SCORE 		    = 401;  //取款操作
var SUB_GP_USER_TRANSFER_SCORE 	    = 402;  //转账操作
var SUB_GP_USER_INSURE_INFO 	    = 403;  //银行资料
var SUB_GP_QUERY_INSURE_INFO 	    = 404;  //查询银行
var SUB_GP_USER_INSURE_SUCCESS 	    = 405;  //银行成功
var SUB_GP_USER_INSURE_FAILURE 	    = 406;  //银行失败
var SUB_GP_QUERY_USER_INFO_REQUEST  = 407;  //查询用户
var SUB_GP_QUERY_USER_INFO_RESULT   = 408;  //用户信息

//自定义字段查询 公告
var SUB_GP_QUERY_PUBLIC_NOTICE  = 500;      //自定义字段查询
var SUB_GP_PUBLIC_NOTICE	    = 501;

//设置推荐人结果
var SUB_GP_SPREADER_RESOULT	    = 520;      //设置推荐人结果

//游戏记录
var SUB_GP_GAME_RECORD_LIST	    = 550;
var SUB_GP_GAME_RECORD_TOTAL    = 551;
var SUB_GP_GAME_RECORD_CHILD    = 552;

//操作结果
var SUB_GP_OPERATE_SUCCESS 	    = 900;      //操作成功
var SUB_GP_OPERATE_FAILURE 	    = 901;      //操作失败
//服务命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//携带信息 CMD_GP_UserIndividual
var DTP_GP_UI_NICKNAME			= 1;        //用户昵称
var DTP_GP_UI_USER_NOTE			= 2;	    //用户说明
var DTP_GP_UI_UNDER_WRITE		= 3;	    //个性签名
var DTP_GP_UI_QQ				= 4;	    //Q Q 号码
var DTP_GP_UI_EMAIL				= 5;	    //电子邮件
var DTP_GP_UI_SEAT_PHONE		= 6;	    //固定电话
var DTP_GP_UI_MOBILE_PHONE		= 7;	    //移动电话
var DTP_GP_UI_COMPELLATION		= 8;	    //真实名字
var DTP_GP_UI_DWELLING_PLACE	= 9;	    //联系地址
var DTP_GP_UI_HEAD_HTTP			= 10;	    //头像
var DTP_GP_UI_IP				= 11;		//IP
var DTP_GP_UI_CHANNEL			= 12;		//渠道号
var DTP_GP_UI_GPS				= 13;	    //GPS
//携带信息 CMD_GP_UserIndividual
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//手机登录命令
var MDM_MB_LOGON 				= 100;	    //广场登录

//登录模式
var SUB_MB_LOGON_GAMEID 		= 1;	    //I D 登录
var SUB_MB_LOGON_ACCOUNTS 		= 2;	    //帐号登录
var SUB_MB_REGISTER_ACCOUNTS 	= 3;	    //注册帐号

//登录结果
var SUB_MB_LOGON_SUCCESS 		= 100;	    //登录成功
var SUB_MB_LOGON_FAILURE 		= 101;	    //登录失败

//升级提示
var SUB_MB_UPDATE_NOTIFY		= 200;	    //升级提示
//手机登录命令
///////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////
//手机列表命令
var MDM_MB_SERVER_LIST 			= 101;	    //列表信息

//列表信息
var SUB_MB_LIST_KIND 			= 100;	    //种类列表
var SUB_MB_LIST_SERVER 			= 101;	    //房间列表
var SUB_MB_LIST_FINISH 			= 200;	    //列表完成
//手机登录命令
///////////////////////////////////////////////////////////////////////////
