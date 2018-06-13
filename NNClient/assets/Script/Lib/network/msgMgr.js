
var g_msgMgr = null;
var MsgMgr = cc.Class({
	_socket_logon: null,
	_socket_game: null,

	ctor:function() {
		// 登录服务器 socket
		var self = this;
		this._socket_logon = new ZSocket();
		this._socket_logon.status = SOCKET_STATUS.SS_INVALID;
		
		this._socket_logon.onConnect = function(params) {
			var bResult = false;
			if (params.result == 1){
				bResult = true;
			}

			cc.LogonMsgHandler.onConnectResult(bResult);
		};

		this._socket_logon.onMessage = function(params) {
			cc.LogonMsgHandler.onMessage(params);
		};

		this._socket_logon.onStatusChanged = function(params) {
			if (self._socket_logon.status != SOCKET_STATUS.SS_INVALID && params.status == SOCKET_STATUS.SS_INVALID) {
				self._socket_logon.status = params.status;
				cc.LogonMsgHandler.onOffLine();
			}
			
			self._socket_logon.status = params.status;
		};
		
		// 游戏服务器 socket
		this._socket_game = new ZSocket();
		this._socket_game.status = SOCKET_STATUS.SS_INVALID;
		
		this._socket_game.onConnect = function(params) {
			var bResult = false;
			if (params.result == 1) {
				bResult = true;
			}
			
			cc.GameMsgHandler.onConnectResult(bResult);
		};

		this._socket_game.onMessage = function(params) {
			cc.GameMsgHandler.onMessage(params);
		};

		this._socket_game.onStatusChanged = function(params) {
			if (self._socket_game.status != SOCKET_STATUS.SS_INVALID && params.status == SOCKET_STATUS.SS_INVALID) {
				self._socket_game.status = params.status;
				cc.GameMsgHandler.onOffLine();
			}
			
			self._socket_game.status = params.status;
		};
	},

	connectLogonServer:function(ip, port) {
		if (this._socket_logon.status == SOCKET_STATUS.SS_INVALID) {
			this._socket_logon.connect(ip, port);
		}
	},
	connectGameServer:function(ip, port) {
		if (this._socket_game.status == SOCKET_STATUS.SS_INVALID) {
			this._socket_game.connect(ip, port);
		}
	},
	getLogonSocket:function() {
		return this._socket_logon;
	},
	getGameSocket:function() {
		return this._socket_game;
	},
});

MsgMgr.getInstance = function(){
	if(g_msgMgr == null){
		g_msgMgr = new MsgMgr();
	}
	return g_msgMgr;
}

cc.LogonSocket = MsgMgr.getInstance().getLogonSocket();
cc.GameSocket = MsgMgr.getInstance().getGameSocket();

//判断字节序
var isLittleEndian = (function() {
	var buffer = new ArrayBuffer(2);
	new DataView(buffer).setInt16(0, 256, true);
	return new Int16Array(buffer)[0] === 256;
})();

//创建消息包================================
var DataBuilder = cc.Class({
	dataBuffer:null,
	dataView:null,
	offset:0,
	init:function(len){
		this.dataBuffer = new ArrayBuffer(len);
		this.dataView = new DataView(this.dataBuffer);
		this.offset = 0;
	},
	getData:function(){
		return this.dataBuffer.slice(0, this.offset);
	},
	writeDWord:function(value){
		this.dataView.setUint32(this.offset, value, isLittleEndian);
		this.offset += 4;
	},
	writeInt:function(value){
		this.dataView.setInt32(this.offset, value, isLittleEndian);
		this.offset += 4;
	},
	writeWord:function(value){
		this.dataView.setUint16(this.offset, value, isLittleEndian);
		this.offset += 2;
	},
	writeFloat:function(value){
		this.dataView.setFloat32(this.offset, value, isLittleEndian);
		this.offset += 4;
	},
	writeDouble:function(value){
		this.dataView.setFloat64(this.offset, value, isLittleEndian);
		this.offset += 8;
	},
	writeByte:function(value){
		this.dataView.setUint8(this.offset, value, isLittleEndian);
		this.offset += 1;
	},
	writeBoolean:function(value){
		var bByte = 0;
		if(value){
			bByte = 1;
		}
		
		this.dataView.setUint8(this.offset, bByte, isLittleEndian);
		this.offset += 1;
	},
	writeByteArray:function(value, len){
		for(var i=0; i<len; i++){
			this.dataView.setUint8(this.offset, value[i], isLittleEndian);
			this.offset += 1;
		}
	},
	writeTChar:function(value){
		this.dataView.setUint16(this.offset, value.charCodeAt(0), isLittleEndian);
		this.offset += 2;
	},
	writeTCharArray:function(value, len){
		if(cc.sys.os == cc.sys.OS_WINDOWS){
			value = cc.MyUtil.utf8to16(value);
		}
		
		for (var i = 0; i < len; i++) {
			if(value && i < value.length){
				this.dataView.setUint16(this.offset, value.charCodeAt(i), isLittleEndian);
				this.offset += 2;
			}else{
				this.dataView.setUint16(this.offset, 0, isLittleEndian);
				this.offset += 2;
			}

		}
	},
	writeChar:function(value){
		this.dataView.setUint8(this.offset, value.charCodeAt(0), isLittleEndian);
		this.offset += 1;
	},
	writeCharArray:function(value, len){
		if(cc.sys.os == cc.sys.OS_WINDOWS){
			// value = cc.MyUtil.utf8to16(value);
		}
		
		for (var i = 0; i < len; i++) {
			if(value && i < value.length){
				this.dataView.setUint8(this.offset, value.charCodeAt(i), isLittleEndian);
				this.offset += 1;
			}else{
				this.dataView.setUint8(this.offset, 0, isLittleEndian);
				this.offset += 1;
			}

		}
	},
	writeInt64Number:function(value){
		var dWord1 = Math.floor( value / Math.pow(2, 32) ) >>> 0;
		var dWord2 = (value % Math.pow(2, 32)) >>> 0;
		
		if(isLittleEndian){
			this.writeDWord(dWord2);
			this.writeDWord(dWord1);
		}else{
			this.writeDWord(dWord1);
			this.writeDWord(dWord2);
		}
	},
	//writeInt64Buffer([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
	writeInt64Buffer:function(value){
		var i;
		
		if(isLittleEndian){
			for(i=7; i<0; i--){
				this.writeByte(value[i]);
			}
		}else{
			for(i=0; i<8; i++){
				this.writeByte(value[i]);
			}
		}
	},
	writeArrayBuffer:function(buffer){
		new Uint8Array(this.dataBuffer, 0, this.dataBuffer.byteLength).set(new Uint8Array(buffer), this.offset);
        this.offset += buffer.byteLength;
	},

	//根据格式写入
	//	[
	//	 [描述,类型,值],
	//	 [描述,类型,值],
	//	[描述, "STRUCT", [[描述,类型,值],[描述,类型,值]]],
	//	 ...
	//	]
	build:function(dataArray){
		// info[0] 描述
		// info[1] 类型
		// info[2] 值
		// info[3] TCHAR_ARRAY 大小
		for(var i = 0; i < dataArray.length; i++){
			var info = dataArray[i];
			if(!!info){
				switch (info[1]) {
				case "LONG":
				case "INT":
					this.writeInt(info[2]);
					break;
				case "DWORD":
					this.writeDWord(info[2]);
					break;
				case "WORD":
					this.writeWord(info[2]);
					break;
				case "DWORD[]":
					for(var j=0; j<info[3]; j++){
						this.writeDWord(info[2][j]);
					}
					break;
				case "WORD[]":
					for(var j=0; j<info[3]; j++){
						this.writeWord(info[2][j]);
					}
					break;
				case "SCORE[]":
				case "LONGLONG[]":
				case "INT64_NUMBER[]":
					for(var j=0; j<info[3]; j++){
						this.writeInt64Number(info[2][j]);
					}
					break;
				case "FLOAT":
					this.writeFloat(info[2]);
					break;
				case "DOUBLE":
					this.writeDouble(info[2]);
					break;
				case "BYTE":
					this.writeByte(info[2]);
					break;
				case "BOOL":
				case "BOOLEAN":
					this.writeBoolean(info[2]);
					break;
				case "BYTE[]":
					this.writeByteArray(info[2], info[3]);
					break;
				case "TCHAR":
					this.writeTChar(info[2]);
					break;
				case "TCHARS":
					this.writeTCharArray(info[2], info[3]);
					break;
				case "CHAR":
					this.writeChar(info[2]);
					break;
				case "CHARS":
					this.writeCharArray(info[2], info[3]);
					break;
				case "SCORE":
				case "LONGLONG":
				case "INT64_NUMBER":
					this.writeInt64Number(info[2]);
					break;
				case "INT64_BUFFER":
					this.writeInt64Buffer(info[2]);
					break;
				case "STRUCT":
					this.build(info[2]);
					break;
				case "BUFFER":
					this.writeArrayBuffer(info[2]);
					break;
				default:
					break;
				}
			}
		}
	}
});


//消息包解析=====================================
var DataParser = cc.Class({
	dataBuffer:null,
	dataView:null,
	offset:0,
	getOffset: function(){
		return this.offset;
	},
	init:function(buffer){
		this.dataBuffer = buffer;
		this.dataView = new DataView(this.dataBuffer);
		this.offset = 0;
	},
	readDWord:function(){
		var ret = this.dataView.getUint32(this.offset, isLittleEndian);
		this.offset += 4;
		
		return ret;
	},
	readInt:function(){
		var ret = this.dataView.getInt32(this.offset, isLittleEndian);
		this.offset += 4;
		
		return ret;
	},
	readWord:function(){
		var ret = this.dataView.getUint16(this.offset, isLittleEndian);
		this.offset += 2;
		
		return ret;
	},
	readFloat:function(){
		var ret = this.dataView.getFloat32(this.offset, isLittleEndian);
		this.offset += 4;
		
		return ret;
	},
	readDouble:function(){
		var ret = this.dataView.getFloat64(this.offset, isLittleEndian);
		this.offset += 8;
		
		return ret;
	},
	readByte:function(){
		var ret = this.dataView.getUint8(this.offset, isLittleEndian);
		this.offset += 1;
		
		return ret;
	},
	readBoolean: function(){
		var value = this.dataView.getUint8(this.offset, isLittleEndian);
		this.offset += 1;
		
		var ret = false;
		if(value == 1){
			ret = true;
		}

		return ret;
	},
	readChar:function(){
		var value = this.dataView.getUint8(this.offset,  isLittleEndian);
		this.offset += 1;
		ret = String.fromCharCode(value);
		return ret;
	},
	readCharArray:function(len){
		/*var ret = [];
		var offset = this.offset;
		for (var i = 0; i < len; i++) {
			var value = this.dataView.getUint8(offset, isLittleEndian);
			offset += 1;
			ret.push(value);
			if (value == 0) {
				break;
			}
		}
		this.offset += len;
		return cc.MyUtil.fromBytes(ret);*/

		var ret = [];
        var offset = this.offset;
        for (var i = 0; i < len; i++) {
            var value = this.dataView.getUint8(offset, isLittleEndian);
            ret.push(value);
            offset += 1;
            if(offset >= this.dataView.byteLength)
                break;
            if (value == 0) {
                break;
            }
        }
        this.offset += len;
        return decodeURI(cc.MyUtil.fromBytes(ret));
	},
	
	readInt64Number:function(){		
		var ret = 0;
		
		var dWord1 = this.readDWord();
		var dWord2 = this.readDWord();

		if(isLittleEndian){
			//负数
			if(dWord2 >= 0x80000000){
				dWord1 = ~dWord1;				
				dWord1 = dWord1 >>> 0 ;
				dWord2 = ~dWord2;
				
				ret = 0 - (dWord2 * Math.pow(2, 32) + dWord1 + 1);
			}else{
				ret = dWord2 * Math.pow(2, 32) + dWord1;
			}
		}else{
			//负数
			if(dWord1 >= 0x80000000){
				dWord1 = ~dWord1;
				dWord2 = ~dWord2;
				dWord2 = dWord2 >>> 0 ;
				ret = 0 - (dWord1 * Math.pow(2, 32) + dWord2 + 1);
			}else{
				ret = dWord1 * Math.pow(2, 32) + dWord2;
			}
		}

		return ret;
	},
	//return [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
	readInt64Buffer:function(){
		var rets = [];
		var i;

		for(i=0; i<8; i++){
			var ret = this.readByte();

			if(isLittleEndian){
				rets.unshift(ret);
			}else{
				rets.push(ret);
			}
		}

		return rets;
	},
	
	readBooleanArray: function(len){
		var ret = [];
		
		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readBoolean();
		}

		return ret;
	},
	
	readBooleanrray2: function(len1, len2){
		var ret = [];

		var i;
		var j;
		for(i=0; i<len1; i++){
			ret[i] = [];
			
			for(j=0; j<len2; j++){
				ret[i][j] = this.readBoolean();
			}
		}

		return ret;
	},
	
	readByteArray: function(len){
		var ret = [];
		
		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readByte();
		}

		return ret;
	},
	
	readByteArray2: function(len1, len2){
		var ret = [];

		var i;
		var j;
		for(i=0; i<len1; i++){
			ret[i] = [];
			
			for(j=0; j<len2; j++){
				ret[i][j] = this.readByte();
			}
		}

		return ret;
	},
	
	readIntArray: function(len){
		var ret = [];
		
		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readInt();
		}

		return ret;
	},
	
	readWordArray: function(len){
		var ret = [];
		
		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readWord();
		}

		return ret;
	},
	
	readDWordArray: function(len){
		var ret = [];
		
		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readDWord();
		}

		return ret;
	},
	
	readFloatArray: function(len){
		var ret = [];
		
		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readFloat();
		}

		return ret;
	},
	
	readInt64NumberArray: function(len){
		var ret = [];

		var i;
		for(i=0; i<len; i++){
			ret[i] = this.readInt64Number();
		}

		return ret;
	},

	readArrayBuffer:function(len){
		var dst = new ArrayBuffer(len);
		new Uint8Array(dst).set(new Uint8Array(this.dataBuffer, this.offset));
        this.offset += len;
		return dst;
	},

	//根据格式解析
	//	[
	//	[key,类型,数组大小],
	//	[key,类型,数组大小],
		//嵌套结构体
	//	[key, "STRUCT", [[key,类型,数组大小],[key,类型,数组大小]]],
	//	...
	//	]
	parse: function(structArray){
		var parseData = {};
		
		// info[0] key
		// info[1] 类型
		// info[2] 数组大小
		for(var i = 0; i < structArray.length; i++){
			var info = structArray[i];
			if(!!info){
				switch (info[1]) {
				case "LONG":
				case "INT":
					parseData[info[0]] = this.readInt();
					break;
				case "DWORD":
					parseData[info[0]] = this.readDWord();
					break;
				case "WORD":
					parseData[info[0]] = this.readWord();
					break;
				case "FLOAT":
					parseData[info[0]] = this.readFloat();
					break;
				case "FLOAT[]":
					parseData[info[0]] = [];
					for(var j=0; j<info[2]; j++){
						parseData[info[0]][j] = this.readFloat();
					}
					break;
				case "DOUBLE":
					parseData[info[0]] = this.readDouble();
					break;
				case "INT[]":
					parseData[info[0]] = [];
					for(var j=0; j<info[2]; j++){
						parseData[info[0]][j] = this.readInt();
					}
					break;
				case "DWORD[]":
					parseData[info[0]] = [];
					for(var j=0; j<info[2]; j++){
						parseData[info[0]][j] = this.readDWord();
					}
					break;
				case "WORD[]":
					parseData[info[0]] = [];
					for(var j=0; j<info[2]; j++){
						parseData[info[0]][j] = this.readWord();
					}
					break;
				case "BYTE":
					parseData[info[0]] = this.readByte();
					break;
				case "BOOL":
				case "BOOLEAN":
					parseData[info[0]] = this.readBoolean();
					break;
				case "BOOL[]":
				case "BOOLEAN[]":
					parseData[info[0]] = this.readBooleanArray(info[2]);				
					break;
				case "BOOL[][]":
				case "BOOLEAN[][]":
					parseData[info[0]] = this.readBooleanArray2(info[2], info[3]);				
					break;
				case "BYTE[]":
					parseData[info[0]] = this.readByteArray(info[2]);
					break;
				case "BYTE[][]":
					parseData[info[0]] = this.readByteArray2(info[2], info[3]);
					break;
				case "CHAR":
					parseData[info[0]] = this.readChar();
					break;
				case "CHARS":
					parseData[info[0]] = this.readCharArray(info[2]);
					break;
				case "CHARS[]":
					parseData[info[0]] = [];
					for(var j=0; j<info[2]; j++){
						parseData[info[0]][j] = this.readCharArray(info[3]);
					}
					break;
				case "SCORE":
				case "LONGLONG":
				case "INT64_NUMBER":
					parseData[info[0]] = this.readInt64Number();
					break;
				case "SCORE[]":
				case "LONGLONG[]":
				case "INT64_NUMBER[]":
					parseData[info[0]] = this.readInt64NumberArray(info[2]);
					break;
				case "INT64_BUFFER":
					parseData[info[0]] = this.readInt64Buffer();
					break;
				case "STRUCT":
					parseData[info[0]] = this.parse(info[2]);
					break;
				case "STRUCT[]":
					parseData[info[0]] = [];
					for(var j=0; j<info[3]; j++){
						parseData[info[0]][j] = this.parse(info[2]);
					}
					break;
				case "SYSTEMTIME":
					parseData[info[0]] = this.parse([
					                                 ["wYear", "WORD"],
					                                 ["wMonth", "WORD"],
					                                 ["wDayOfWeek", "WORD"],
					                                 ["wDay", "WORD"],
					                                 ["wHour", "WORD"],
					                                 ["wMinute", "WORD"],
					                                 ["wSecond", "WORD"],
					                                 ["wMilliseconds", "WORD"]
					                                 ]);
					break;
				case "BUFFER":
					parseData[info[0]] = this.readArrayBuffer(info[2]);
				default:
					break;
				}
			}
		}
		
		return parseData;
	},
});

module.exports = {
	MsgMgr,
	DataBuilder,
	DataParser,
};

/*
var testb = 9999999999;
var dataBuilderb = new DataBuilder();
dataBuilderb.init(8);
dataBuilderb.writeInt64Number(testb);
var datab = dataBuilderb.getData()

var dataParserb = new DataParser();
dataParserb.init(datab);

var valueb = dataParserb.readInt64Buffer();
cc.log("======================== valueb = " + valueb);
var str = "";
for(var i=0; i<8; i++){
	str += valueb[i].toString(16);
}
cc.log("======================== valueb = " + str);
/////////////////////////////////////////////////////////
var testa = 9999999999;
var dataBuildera = new DataBuilder();
dataBuildera.init(8);
dataBuildera.writeInt64Number(testa);
var dataa = dataBuildera.getData()

var dataParsera = new DataParser();
dataParsera.init(dataa);

var valuea = dataParsera.readInt64Number();
cc.log("======================== valuea = " + valuea);
*/