(function() {
  'use strict';
  angular.module("dbaumann.identity-map", []).provider("IdentityMap", function() {
    this.$get = function() {
      var collection, collectionKey, entityKey;
      collection = {};
      collectionKey = function(type, requireConstructor) {
        if (requireConstructor == null) {
          requireConstructor = false;
        }
        if (requireConstructor && !(angular.isFunction(type) && (type.prototype.identity != null))) {
          throw TypeError("expected entity constructor");
        }
        if (angular.isString(type)) {
          return type;
        } else {
          return type.name;
        }
      };
      entityKey = function(type, entity, requireEntity) {
        if (requireEntity == null) {
          requireEntity = true;
        }
        if (typeof entity !== "object") {
          if (requireEntity) {
            throw TypeError("expected entity");
          } else {
            return entity;
          }
        } else {
          return (angular.isFunction(entity.identity) ? entity : new type(entity)).identity();
        }
      };
      return {
        set: function(type, replace) {
          var cKey;
          if (replace == null) {
            replace = false;
          }
          cKey = collectionKey(type);
          if (collection[cKey] == null) {
            collection[cKey] = {};
          }
          return function(entity) {
            var eKey;
            eKey = entityKey(type, entity);
            if ((collection[cKey][eKey] == null) || replace) {
              collection[cKey][eKey] = entity;
            }
            return void 0;
          };
        },
        replace: function(type) {
          return (function(_this) {
            return function(entity) {
              return _this.set(type, true)(entity);
            };
          })(this);
        },
        get: function(type) {
          var cKey;
          cKey = collectionKey(type);
          if (collection[cKey] == null) {
            throw Error("'" + cKey + "' collection not found");
          }
          return function(keyOrEntity) {
            var eKey;
            eKey = entityKey(type, keyOrEntity, false);
            return collection[cKey][eKey];
          };
        },
        update: function(type, branches) {
          if (branches == null) {
            branches = [];
          }
          collectionKey(type);
          if (branches.length === 0) {
            throw Error("no branches provided to IdentityMap.update");
          }
          branches = branches.map(function(path) {
            if (angular.isString(path)) {
              return [path];
            } else {
              return path;
            }
          });
          return (function(_this) {
            return function(entity) {
              var eKey, existingTraverse, k, newTraverse, _i, _len;
              eKey = entityKey(type, entity);
              existingTraverse = traverse(_this.get(type)(eKey));
              newTraverse = traverse(new type(entity));
              for (_i = 0, _len = branches.length; _i < _len; _i++) {
                k = branches[_i];
                existingTraverse.set(k, newTraverse.get(k));
              }
              return existingTraverse.value;
            };
          })(this);
        }
      };
    };
    return void 0;
  });

}).call(this);
