/*
 * IndexedDB Manager
 *
 * */
(function($, window, document, undefined){
	'use strict';

	var SqlManager = function(){
		this.__construct();
	};

	var proto = SqlManager.prototype;

	proto.debug = false;
	proto.dbs   = {};

	//--------Methods--------//
	proto.__construct = function() {
		var scope = this;
	};

	proto.open = function(dbName, version, size, keys, success, error, callback) {
		var scope = this;
		var result = openDatabase(dbName, version, capitalize(dbName), size * 1024 * 1024);
		var keysText = "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, created";
		$.each(keys, function(index, val) {
			keysText += ", " + val;
		});
		result.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS ' + dbName.toUpperCase() + ' ('+ keysText +')', [],
				function (tx, results) {
					if (scope.debug) {
						console.info("open :: success");
						console.warn(arguments);
					}

					if (typeof success === "function") {
						success.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("open :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
		});
		return result;
	};

	proto.add = function(db, dbName, keys, values, success, error, callback) {
		var scope = this;
		var keysText = "created, ";
		var valuesText = new Date().getTime() + ", ";
		$.each(keys, function(index, val) {
			keysText += val;
			valuesText += "?";
			if (keys.length != index + 1) {
				keysText += ", ";
				valuesText += ", ";
			}
		});

		var newValues = [];
		$.each(values, function(index, val) {
			if (typeof val == "object") {
				val = JSON.stringify(val);
			}
			newValues.push(val);
		});

		db.transaction(function (tx) {
			tx.executeSql('INSERT INTO ' + dbName.toUpperCase() + ' ('+ keysText +') VALUES ('+ valuesText +')', newValues,
				function (tx, results) {
					if (scope.debug) {
						console.info("add :: success");
						console.warn(arguments);
					}

					if (typeof success === "function") {
						success.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("add :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
		});
		return db;
	};


	var addManyIndex = 0;
	var addManyCount = 0;
	proto.addMany = function(db, dbName, keys, array, callback) {
		var scope = this;
		var keysText = "created, ";
		var valuesText = new Date().getTime() + ", ";
		$.each(keys, function(index, val) {
			keysText += val;
			valuesText += "?";
			if (keys.length != index + 1) {
				keysText += ", ";
				valuesText += ", ";
			}
		});

		db.transaction(function (tx) {
			addManyCount = array.length;
			$.each(array, function(index, item) {
				var newValues = [];
				$.each(item, function(index, val) {
					if (typeof val == "object") {
						val = JSON.stringify(val);
					}
					newValues.push(val);
				});
				tx.executeSql('INSERT INTO ' + dbName.toUpperCase() + ' ('+ keysText +') VALUES ('+ valuesText +')', newValues,
					function (tx, results) {
						if (scope.debug) {
							console.info("add :: success");
							console.warn(arguments);
						}
						addManyIndex ++;
						if (addManyIndex == addManyCount - 1) {
							callback.call(scope);
						}
					},
					function() {
						if (scope.debug) {
							console.warn("add :: error");
							console.warn(arguments);
						}
						addManyIndex ++;
						if (addManyIndex == addManyCount - 1) {
							callback.call(scope);
						}
					}
				);
			});
		});
		return db;
	};

	proto.update = function(db, dbName, fields, values, wKey, wValue, success, error, callback) {
		var scope = this;

		var fields = null;
		db.transaction(function (tx) {
			tx.executeSql('UPDATE FROM ' + dbName.toUpperCase() + 'SET ' + ' WHERE ' + wKey + '="' + wValue + '"', [],
				function (tx) {
					if (scope.debug) {
						console.info("update :: success");
						console.warn(arguments);
					}

					if (typeof success === "function") {
						success.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("update :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
			//transaction.executeSql("UPDATE page_settings SET fname=?, bgcolor=?, font=?, favcar=? WHERE id = 1", [fname, bg, font, car]);
		});
		return db;
	};

	proto.remove = function(db, dbName, key, value, success, error, callback) {
		var scope = this;
		db.transaction(function (tx) {
			tx.executeSql('DELETE FROM ' + dbName.toUpperCase() + ' WHERE ' + key + '="' + value + '"', [],
				function (tx) {
					if (scope.debug) {
						console.info("remove :: success");
						console.warn(arguments);
					}

					if (typeof success === "function") {
						success.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("remove :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
		});
		return db;
	};

	proto.get = function(db, dbName, key, value, success, error, callback) {
		var scope = this;
		db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM ' + dbName.toUpperCase() + ' WHERE ' + key + '="' + value + '"', [],
				function (tx, results) {
					if (scope.debug) {
						console.info("get :: success");
						console.warn(arguments);
					}

					var newResults = [];
					for (var i=0; i < results.rows.length; i++){
						newResults.push(results.rows.item(i));
					}

					if (typeof success === "function") {
						success.call(scope, newResults);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("get :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
		});
		return db;
	};

	proto.getAll = function(db, dbName, success, error, callback) {
		var scope = this;
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM '+ dbName.toUpperCase() +'', [],
				function (tx, results) {
					if (scope.debug) {
						console.info("getAll :: success");
						console.warn(arguments);
					}
					var newResults = [];
					for (var i=0; i < results.rows.length; i++){
						newResults.push(results.rows.item(i));
					}

					if (typeof success === "function") {
						success.call(scope, newResults);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("getAll :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
		});
		return db;
	};

	proto.close = function(db, dbName, success, error, callback) {
		var scope = this;
		db.transaction(function (tx) {
			tx.executeSql('DROP TABLE IF EXISTS ' + dbName.toUpperCase() + '', [],
				function (tx, results) {
					if (scope.debug) {
						console.info("close :: success");
						console.warn(arguments);
					}

					if (typeof success === "function") {
						success.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				},
				function() {
					if (scope.debug) {
						console.warn("close :: error");
						console.warn(arguments);
					}

					if (typeof error === "function") {
						error.call(scope);
					}
					if (typeof callback === "function") {
						callback.call(scope);
					}
				}
			);
		});
		return db;
	};

	var capitalize = function(text) {
		return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
	};

	if (window.openDatabase) {
		window.SQLmanager = new SqlManager();
	}
}(jQuery, window, document));