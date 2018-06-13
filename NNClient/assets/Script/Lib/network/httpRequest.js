
var g_httpRequest = null;
var HttpRequest = cc.Class({
	ctor: function () {
	},

	reset: function(){
	},

	init:function(layer){
	},
	
	streamXHREvents: function(xhr){
		//['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout']
		xhr.onerror = function () {
			cc.log("请求数据失败，请联系客服！");
		}
		
		xhr.ontimeout = function () {
			cc.log("请求数据超时，请联重新尝试！");
		}
	},
	
	sendGetRequest: function(url, jsonData, cb) {
		var param = "";
		var head = "?";
		
		for(key in jsonData){
			param += head;
			head = "&";
		
			param += key;
			param += "=";
			var value = jsonData[key];
			value = encodeURIComponent(value);
			param += value;
		}
		
		var urlArgs = url + param;
		
		var self = this;
		var xhr = cc.loader.getXMLHttpRequest();
		//set arguments with <URL>?xxx=xxx&yyy=yyy
		xhr.open("GET", urlArgs, true);

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var httpStatus = xhr.statusText;
				var response = xhr.responseText;
				
				if(cb){
					cb(response);
				}
			}
		};

		this.streamXHREvents(xhr);
		
		xhr.send();
	},

	sendPostPlainText: function(url, msg, cb) {
		var self = this;
		var xhr = cc.loader.getXMLHttpRequest();
		xhr.open("POST", url);
		//set Content-type "text/plain;charset=UTF-8" to post plain text
		xhr.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var httpStatus = xhr.statusText;
				var response = xhr.responseText;

				if(cb){
					cb(response);
				}
			}
		};

		this.streamXHREvents(xhr);
		
		xhr.send(msg);
	},

	sendPostForms: function(url, args, cb) {
		//cc.log("sendPostForms url = " + url);
		//cc.log("sendPostForms args = " + args);
		var self = this;
		var xhr = cc.loader.getXMLHttpRequest();
		xhr.open("POST", url);
		//set Content-Type "application/x-www-form-urlencoded" to post form data
		//mulipart/form-data for upload
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var httpStatus = xhr.statusText;
				var response = xhr.responseText;
				//var json = JSON.parse(xhr.responseText);

				if(cb){
					cb(response);
				}
			}
		};
		
		this.streamXHREvents(xhr);

		xhr.send(args);

	},

	sendPostJson: function(url, jsonData, cb) {
		var self = this;
		var xhr = cc.loader.getXMLHttpRequest();
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type","application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var httpStatus = xhr.statusText;
				var response = xhr.responseText;

				if(cb){
					cb(response);
				}
			}
		};
		
		var data = JSON.stringify(jsonData);
		//data = "Param=\"" + data + "\"";
		cc.log("send json url = " + url);
		cc.log("send json data = " + data);

		this.streamXHREvents(xhr);
		
		xhr.send(data);

	},
	
	sendDelete: function(url, cb){
		var self = this;
		var xhr = cc.loader.getXMLHttpRequest();
		xhr.open("DELETE", url);
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var httpStatus = xhr.statusText;
				var response = xhr.responseText;

				if(cb){
					cb(response);
				}
			}
		};

		this.streamXHREvents(xhr);
		
		xhr.send(null);

	},
});

HttpRequest.getInstance = function() {
	if (!g_httpRequest) {
		g_httpRequest = new HttpRequest();
	}
	return g_httpRequest;
};
module.exports = HttpRequest;

/*
var testhttp = new HttpRequest();

testhttp.sendGetRequest(
		"http://www.yq175.com/assets/project_qpgame.manifest",
		function(response){
			cc.log("sendGetRequest : " + response);
		}
);

testhttp.sendGetRequest(
		"http://httpbin.org/get?show_env=1",
		function(response){
			cc.log("sendGetRequest : " + response);
		}
);

testhttp.sendPostPlainText(
		"http://httpbin.org/post",
		"plain text message",
		function(response){
			cc.log("sendPostPlainText : " + response);
		}
);

testhttp.sendPostForms(
		"http://httpbin.org/post",
		"a=hello&b=world",
		function(response){
			cc.log("sendPostForms : " + response);
		}
);

testhttp.sendPostJson(
		"http://httpbin.org/post",
		{
            "a" : "hello",
            "b" : "world"
        },
		function(response){
			cc.log("sendPostJson : " + response);
		}
		);

//*/