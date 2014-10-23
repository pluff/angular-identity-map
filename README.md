## angular-identity-map

An [identity map pattern](http://en.wikipedia.org/wiki/Identity_map_pattern) implementation for AngularJS applications.

## Requirements

AngularJS v1.0+
traverse

## Getting started

### with bower

Just include "angular-identity-map" to your dependencies list and run `bower install`

### with npm

`npm install angular-identity-map`


### manually

Download [angular-identity-map.js](https://raw.githubusercontent.com/pluff/angular-identity-map/master/dist/angular-identity-map.min.js) and include it on your page along with AngularJS
Add `identity-map` to your module dependencies
```javascript
angular.module('myApp', ['identity-map']);
```

## Usage

### Pre-requirements
All objects you want to map must have `id` attribute and `class_name` attribute in order to retrieve object identification pair. This pair (class_name, id) MUST be unique.
Both these behaviors can be customized. See Configuration chapter below.


### All you need is .map

```javascript
var myAppModule = angular.module("MyApp", ["identity-map"]);

myAppModule.controller("myController", function($scope, IdentityMap) {
  $scope.phoneList = [
    {id: 1, class_name: 'Phone', name: 'Emergency', value: '911'}
  ];
  IdentityMap.map($scope.phoneList);
  
  //Let's assume you somehow retrieved new phone list e.g. by using Restangular
   newPhoneList = [
     {id: 1, class_name: 'Phone', name: 'Emergency', value: 'call-911'},
     {id: 2, class_name: 'Phone', name: 'Mommy', value: '12345'}
   ];
   IdentityMap.map(newPhoneList); 
   $scope.phoneList[0].value; // "call-911"
   //However your $scope.phoneList still has 1 item, while newPhoneList has 2 items. 
   //Remember, IdentityMap stores objects only.
}
```

You can see and play around with [live demo](http://plnkr.co/edit/jDiMgjnQYitBYTx9Mqth?p=preview)! 

### Others methods for those, who want to dig deeply into identity map

There are several methods available such as `.get`, `.set`, `.detach`, `.clear` etc. 
Check out the source code for more information.

### Configuration

identity-map stores and retrieves object using object type and object id.
By default object id is retrieved by calling `id` attribute on an object. Object type retrieved by calling `class_name` attribute on an object.
These functions are configurable in service provider:
Example:
```javascript
app.config(function(IdentityMapProvider) {
  //retrieves object type for mapping from object constructor name.
  IdentityMapProvider.setEntityTypeFn(function(entity) { 
    return entity.constructor.name; 
  });
  //retrieves object id for mapping by calling "getGlobalId" function.
  IdentityMapProvider.setEntityFn(function(type, entity) { 
      return entity.getGlobalId(); 
    });  
});
```
Please pay attention to couple requirements for these functions:

1. Any pair of (entityType, entityId) values MUST represent one and only one entity object.
2. Both functions accept one param which is guaranteed to be an object. If `entity` param is not a mappable object both functions MUST return `undefined`.  

More examples can be found in spec/IdentityMap_spec.coffee

### Integration with Restangular

"identity-map" can be integrated with Restangular easily.
You just need to add simple response interceptor to Restangular stack:
```javascript
angular.module('myApp', ['restangular', 'identity-map']).run(
function (Restangular, IdentityMap) {
  Restangular.addResponseInterceptor(
    function (data, operation, what, url, response, deffered) {
      return IdentityMap.map(data);
    }
  );
});
```
Starting from now any Restangular response with "mappable" objects will be mapped automatically.


## Development

Code quality is ensured with CoffeeScript, CoffeeLint, and Karma.
```sh
npm install -g grunt-cli
npm install && bower install
grunt
```

### Live Reloading

```sh
grunt karma:unit:start watch
```

### Build

```sh
grunt dist
```

## TODO

See [issues list](https://github.com/pluff/angular-identity-map/issues?q=is%3Aopen)


## Contribute

1. Fork
2. Code
3. Submit PR

## License

[MIT](https://raw.githubusercontent.com/pluff/angular-identity-map/master/LICENSE)


