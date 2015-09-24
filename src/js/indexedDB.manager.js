/*
 * IndexedDB Manager
 *
 * */
(function($, window, document, undefined){
	'use strict';

	var IndexedDBManager = function(){
		this.__construct();
	};

	var proto = IndexedDBManager.prototype;

	proto.dbs = {};

	//--------Methods--------//
	proto.__construct = function() {
	};

	proto.open = function(dbName, version, callback, indexs) {
		var scope = this;
		if (!scope.dbs[dbName]) {
			scope.dbs[dbName] = {};
		}

		var request = indexedDB.open(dbName, version);

		request.onsuccess = function(e) {
			scope.dbs[dbName].db = e.target.result;
            callback.call(scope, scope.dbs[dbName].db);
		};
		request.onerror = function(e) {
			console.log(arguments);
		};
		request.onupgradeneeded = function(e) {
			var db = e.target.result;
			if(db.objectStoreNames.contains("single")) {
				db.deleteObjectStore("single");
			}
			var key = db.createObjectStore("single", {keyPath: 'timestamp'});
            if (indexs) {
                $.each(indexs, function(index, item) {
                    key.createIndex(index, item.name, item.options);
                });
            }
		};
		return this;
	};

	proto.add = function(dbName, data, callback) {
        var scope = this;
		if (!this.dbs[dbName].db) {
            console.warn("you need to open your db first", dbName);
        }
		var transaction   = this.dbs[dbName].db.transaction(['single'], "readwrite");
        var objStore      = transaction.objectStore('single');
        var timestamp     = new Date().getTime();
        var single        = data;
        single.timestamp  = timestamp;
        var request       = objStore.put(single);

        request.onsuccess = function(e) {
            callback.call(scope, single);
        };
        request.onerror   = function(e) {
            console.warn("item was not added.", single, e);
        };
		return this;
	};

	proto.remove = function(dbName, timestamp, callback) {
        var scope = this;
        if (!this.dbs[dbName].db) {
            console.warn("you need to open your db first", dbName);
        }
        var transaction   = this.dbs[dbName].db.transaction(['single'], 'readwrite');
        var objStore      = transaction.objectStore('single');
        var request       = objStore.delete(timestamp);

        request.onsuccess = function(e) {
            callback.call(scope, e);
        };
        request.onerror   = function(e) {
            console.log("item was not removed.", timestamp, e);
        };
		return this;
	};

    proto.getAll = function(dbName, callback) {
        var scope = this;
        var transaction  = this.dbs[dbName].db.transaction(['single'], 'readwrite');
        var objStore     = transaction.objectStore('single');
        var keyRange     = IDBKeyRange.lowerBound(0);
        var queryRequest = objStore.openCursor(keyRange);

        var items = [];
        transaction.oncomplete = function(e) {
            callback.call(scope, items);
        };

        queryRequest.onsuccess = function(e) {
            var result = e.target.result;
            if (!!result == false) {
                return;
            }
            items.push(result.value);
            result.continue();
        };

        queryRequest.onerror = function(e) {
            console.warn('Query not able to be executed', e);
        };
        return this;
    };

	proto.getSingle = function(dbName, key, callback) {
        var scope = this;
		return this;
	};

	proto.close = function(dbName, callback) {
		var scope = this;
		var request = indexedDB.deleteDatabase(dbName);
		request.onsuccess = function(e) {
			if (scope.dbs[dbName]) {
				delete scope.dbs[dbName];
			}
            callback.call(scope, e);
		};
		request.onerror = function(e) {
			console.log(arguments);
		};
		return this;
	};

	if (window.indexedDB) {
		window.IDBmanager = new IndexedDBManager();
	}
}(jQuery, window, document));