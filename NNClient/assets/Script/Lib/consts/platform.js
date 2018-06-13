
var BUILD_VER = 0;		//授权版本
var PRODUCT_VER = 6;	//产品版本

//接口版本
var INTERFACE_VERSION = function(cbMainVer,cbSubVer){
	var value = PRODUCT_VER << 24;
	value += (cbMainVer << 16);
	value += (cbSubVer << 8);
	value += BUILD_VER;
};

//模块版本
var PROCESS_VERSION = function(cbMainVer,cbSubVer,cbBuildVer){
	var value = (PRODUCT_VER << 24);
	value += (cbMainVer << 16);
	value += (cbSubVer << 8);
	value += cbBuildVer;

	return value;
};

//程序版本
var VERSION_FRAME = PROCESS_VERSION(6,0,3);			//框架版本
var VERSION_PLAZA = PROCESS_VERSION(10,0,3);		//大厅版本
var VERSION_MOBILE = PROCESS_VERSION(6,0,3);		//手机版本

var MB_VALIDATE_FLAGS = 0x01                     	//效验密保
var LOW_VER_VALIDATE_FLAGS = 0x02                	//效验低版本

//版本定义
var VERSION_EFFICACY = 0;							//效验版本
var VERSION_FRAME_SDK = INTERFACE_VERSION(6,3);		//框架版本

//设备类型
var DEVICE_TYPE_PC = 0x00;                       	//PC
var DEVICE_TYPE_ANDROID = 0x10;                  	//Android
var DEVICE_TYPE_ITOUCH = 0x20;                   	//iTouch
var DEVICE_TYPE_IPHONE = 0x40;                   	//iPhone
var DEVICE_TYPE_IPAD = 0x80;                     	//iPad
var DEVICE_TYPE = function(){
	var deviceType = DEVICE_TYPE_ANDROID;
	switch (cc.sys.os) {
		case cc.sys.OS_WINDOWS: //模拟安卓
			deviceType = DEVICE_TYPE_ANDROID;
			break;
		case cc.sys.OS_ANDROID:
			deviceType = DEVICE_TYPE_ANDROID;
			break;
		case cc.sys.OS_IOS:
			deviceType = DEVICE_TYPE_IPHONE;
			break;
		case cc.sys.IPAD:
			deviceType = DEVICE_TYPE_IPAD;
			break;
		default:
			deviceType = DEVICE_TYPE_ANDROID; //默认为安卓
		break;
	}
	
	return deviceType;
}();