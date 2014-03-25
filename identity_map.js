/**
 * Identity map pattern for AngularJs
 * @version v0.1 - 2014-03-20 * @link https://github.com/pluff/angular-identitymap
 * @author Pavel Shutsin <publicshady@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var module = angular.module('identity-map', []);

module.provider('identityMap', function () {
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
    var result = map, namespace;
    for (var i = 0; i < uid.length; i++ ) {
      namespace = uid[i];
      if (angular.isUndefined(result[namespace])) {
        return undefined;
      }
      result = result[namespace];
    }
    return result;
  };

  setByUid = function(uid, value) {
    var result = map, namespace;
    for (var i = 0; i < uid.length; i++ ) {
      namespace = uid[i];
      if (angular.isUndefined(result[namespace])) { //ensure tree structure
        result[namespace] = {};
      }
      if (i == uid.length - 1) {
        return result[namespace] = value;
      }
      result = result[namespace];
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
    $get: function () {
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
    },
    setUidGetter: function (uidGetterFn) {
      uidGetter = uidGetterFn;
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

