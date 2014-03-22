/**
 * Identity map pattern for AngularJs
 * @version v0.1 - 2014-03-20 * @link https://github.com/pluff/angular-identitymap
 * @author Pavel Shutsin <publicshady@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var module = angular.module('identity-map', []);

module.service('identityMap', function () {
  var map = {}, mapRecursive, uidGetter, getByUid, setByUid, ensureMapTree;

  uidGetter = function (obj) {
    if (angular.isObject(obj) &&
        angular.isDefined(obj.id) &&
        angular.isDefined(obj.class_name) &&
        !angular.isFunction(obj.id) &&
        !angular.isFunction(obj.class_name)) {
      return [obj.class_name , obj.id];
    } else {
      return undefined;
    }
  };

  getByUid = function(uid) {
    var result = map;
    angular.forEach(uid, function(namespace) {
      result = result[namespace];
    });
    return result;
  };

  setByUid = function(uid, value) {
    var result = map;
    angular.forEach(uid, function(namespace) {
      result = result[namespace];
    });
    return result = value;
  };

  ensureMapTree = function(uid) {
    var namespace, subtree = map;
    for (var i = 0; i < uid.length - 1; i++) { //last item is not a part of tree
      namespace = uid[i];
      if (angular.isUndefined(subtree[namespace])) {
        subtree[namespace] = {};
        subtree = subtree[namespace];
      }
    }
  };

  mapRecursive = function (obj) {
    if (angular.isArray(obj)) {
      angular.forEach(obj, function (value, index) {
        obj[index] = mapRecursive(value);
      });
      return obj;
    } else {
      var objUid = uidGetter(obj);
      if (angular.isDefined(objUid)) {
        if (!angular.isArray(objUid)) { //ensure our UID is an array
          objUid = [objUid];
        }

        angular.forEach(obj, function (property, key) {
          obj[key] = mapRecursive(property);
        });

        ensureMapTree(objUid);

        var mappedObject = getByUid(objUid);

        if (mappedObject) {
          angular.extend(mappedObject, obj);
        } else {
          setByUid(objUid, obj);
          mappedObject = obj;
        }
        return mappedObject;
      } else {
        return obj;
      }
    }
  };

  return {
    map: function (obj) {
      return mapRecursive(obj);
    },
    flush: function () {
      return map = {};
    },
    getMap: function () {
      return map;
    }
  };
});

module.service('identityMapRestangular', function (identityMap) {
  return {
    interceptResponse: function (data, operation, what, url, response, deffered) {
      return identityMap.map(data);
    }
  };
});

