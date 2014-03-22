# Angular Identity Map
An AngularJS module that provides [identity map pattern](http://en.wikipedia.org/wiki/Identity_map_pattern) for Angular.

## Requirements

AngularJS v1.0+

## Getting started

Download [identity_map.js](https://raw.githubusercontent.com/pluff/angular-identitymap/master/identity_map.js) and include it on your page along with AngularJS
```html
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.14/angular.min.js"></script>
<script src="/identity_map.js"></script>
```
Add `identity-map` to your module dependencies
```javascript
angular.module('myApp', ['identity-map']);
```

## Usage

"identity-map" module provides `identityMap` service for mapping purposes.

`identityMap` has three properties:

+ `map`: is a function that accepts one param `obj`. This function will save\update mapped version of `obj` and return it.
This function crawls through the `obj` and maps all child objects too. `map` function accepts arrays as well as single objects.
If `obj` is not a mappable object or array it will be returned as is.

+ `flush`: is a function with no arguments. Flushes entire map.
+ `getMap`: is a function with no arguments. Returns entire identity map. Used mainly for debugging purposes.

you can play with [live demo](http://plnkr.co/edit/hkzl2VDKrJq4s1cyjdZg?p=preview) to check its behavior.

## Objects identification. "Mappable" objects.

"identity-map" assumes that all objects you want to be mapped has 2 attributes `id` and `class_name` which are used to identify objects.
All objects not matching this criteria will be ignored by identity-map.

## Integration with Restangular

"identity-map" module provides simple and convenient way to integrate with Restangular.
You just need to add identity-map response interceptor to Restangular stack:
```javascript
angular.module('myApp', ['restangular', 'identity-map']).run(
function (Restangular, identityMapRestangular) {
  Restangular.addResponseInterceptor(identityMapRestangular.interceptResponse);
});
```
From now any Restangular response that has objects which are "mappable" for "identity-map" will be mapped automatically.


## TODO

1. Tests! We need tests!
1. Extend identity-map functionality to optionally prevent already-loaded objects from loading again. request interceptor for Restangular wanted!
1. Bower\grunt support.

## Contribute

1. Fork
2. Code
3. Submit PR

## License

[MIT](https://raw.githubusercontent.com/pluff/angular-identitymap/master/LICENSE)


