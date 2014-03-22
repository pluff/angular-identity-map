/**
 * Identity map pattern for AngularJs
 * @version v0.1 - 2014-03-20 * @link https://github.com/pluff/angular-identitymap
 * @author Pavel Shutsin <publicshady@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var module = angular.module('identity-map', []);

module.service('identityMap', function () {
  var map = {}, mapRecursive, mapKey;

  mapKey = function (obj) {
    if (angular.isObject(obj) &&
        angular.isDefined(obj.id) &&
        angular.isDefined(obj.class_name) &&
        !angular.isFunction(obj.id) &&
        !angular.isFunction(obj.class_name) &&
        ) {
      return obj.id + obj.class_name;
    } else {
      return undefined;
    }
  }

  mapRecursive = function (obj) {
    if (angular.isArray(obj)) {
      angular.forEach(obj, function (value, index) {
        obj[index] = mapRecursive(value);
      });
      return obj;
    } else {
      var objKey = mapKey(obj);
      if (angular.isDefined(objKey)) {
        angular.forEach(obj, function (property, key) {
          obj[key] = mapRecursive(property);
        });

        var mappedObject = map[objKey];

        if (mappedObject) {
          angular.extend(mappedObject, obj);
        } else {
          map[objKey] = obj;
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

