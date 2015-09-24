/*
 * LocalStorageManager
 * */
(function($, window, document, undefined){
	'use strict';

	var LocalStorageManager = function(){
		this.__construct();
	};

	var proto = LocalStorageManager.prototype;

	//--------Methods--------//
	proto.__construct = function() {
		this.deleteOld();
	};

	proto.set = function(c_name, c_val, expire_day) {
		var value = {};
		if (typeof c_val === "object") {
			value.value = {};
			$.each(c_val, function(index, val){
				value.value[index] = val;
			});
		} else {
			value.value = c_val;
		}
		if (expire_day) {
			var date = new Date();
			date.setDate(date.getDate() + expire_day);
		}
		value.expire = date;
		localStorage.setItem(c_name, JSON.stringify(value));
		return this;
	};

	proto.remove = function(c_name) {
		localStorage.removeItem(c_name);
		return this;
	};

	proto.get = function(c_name, raw) {
		var item = localStorage;
		if (c_name) {
			if (localStorage.getItem(c_name)) {
				if (raw) {
					item = JSON.parse(localStorage.getItem(c_name));
				} else {
					item = JSON.parse(localStorage.getItem(c_name)).value;
				}
			} else {
				console.warn("localStorage :: '" + c_name + "' doesn't exist");
				return this;
			}
		}
		return item;
	};

	proto.has = function(c_name) {
		return (localStorage.getItem(c_name) != null);
	};

	proto.deleteOld = function() {
		var scope = this;
		$.each(localStorage, function(index, val){
			if (val.expire != undefined) {
				var now = new Date();
				if (now > val.expire) {
					scope.remove(index);
				}
			}
		});
	};

	proto.check = function() {
		var customkey = '2jjn1od1i02md-srj9w';
		try {
			localStorage.setItem(customkey, customkey);
			localStorage.removeItem(customkey);
			return true;
		} catch(e) {
			return false;
		}
	};

	if (proto.check()) {
		window.LSmanager = new LocalStorageManager();
	}
}(jQuery, window, document));