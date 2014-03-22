/**
 * Identity map pattern for AngularJs
 * @version v0.1 - 2014-03-20 * @link https://github.com/pluff/angular-identitymap
 * @author Pavel Shutsin <publicshady@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var module = angular.module('identity-map', []);

module.service('identityMap', function() {
  var isMappable, map, mapRecursive;
  map = {};

  isMappable = function(obj) {
    return angular.isArray(obj) || (angular.isObject(obj) && angular.isDefined(obj.id) && angular.isDefined(obj.class_name));
  };

  var mapKey = function(obj) {
    return obj.id+obj.class_name;
  }

  mapRecursive = function(obj) {
    var mappedObject;
    if (angular.isArray(obj)) {
      angular.forEach(obj, function(value, index) {
        if (isMappable(value)) {
          obj[index] = mapRecursive(value);
        }
      });
      return obj;
    } else {
      if (isMappable(obj)) {
        angular.forEach(obj, function(property, key) {
          if (isMappable(property)) {
            obj[key] = mapRecursive(property);
          }
        });

        var objKey = mapKey(obj);

        if (mappedObject = map[objKey]) {
          angular.extend(mappedObject, obj);
        } else {
          map[objKey] = obj;
          mappedObject = obj;
        }
        return mappedObject;
      }
    }
  };

  return {
    map: function(obj) {
      if (isMappable(obj)) {
        return mapRecursive(obj);
      } else {
        return obj;
      }
    },
    flush: function() {
      return map = {};
    },
    getMap: function() {
      return map;
    }
  };
});

module.service('identityMapRestangular', function(identityMap) {
  return {
    interceptResponse: function(data, operation, what, url, response, deffered) {
      return identityMap.map(data);
    }
  };
});

