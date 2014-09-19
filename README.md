## angular-identity-map

An Identity Map implementation for push-based AngularJS applications.

### Why?

Because a large `$scope` is a challenge to maintain. This is particularly true if you're trying to find and mutate objects in response to server side activity. Here we solve this problem using the [Identity Map](http://martinfowler.com/eaaCatalog/identityMap.html) pattern.

Additionally, large applications inevitably involve a lot of customized behavior in the form of functions which end up somewhere in `$scope`. The object oriented way to keep such complexity in check is to define the behavior on the objects, or in javascript, on their [prototypes](http://stackoverflow.com/q/572897/1652907). However once this is done, the objects become difficult to mutate without disturbing their prototypical nature. For this, an `IdentityMap.update` method is provided, which makes use of [traverse](https://github.com/substack/js-traverse) to specify path-based mutations on deeply nested objects in a manner similar to [functional lenses](https://www.youtube.com/watch?v=efv0SQNde5Q).

## Requirements

traverse


## Usage

### App
```javascript
var myAppModule = angular.module("MyApp", ["dbaumann.identity-map"]);

myAppModule.controller("myController", function($scope, IdentityMap, Phone, PhoneImage, myService) {
  $scope.phoneList = [
    new Phone({
      id: 1,
      name: "Dell Streak 7",
      images: [
        new PhoneImage({id: 1, name: "7.0", imagePath: "img/phones/dell-streak-7.0.jpg"})
      ]
    })
  ];

  myService.receive("PhoneUpdate", function(event) {
    var existingPhone = IdentityMap.get(Phone)(event.phone);
    // ... now you can mutate the model in $scope which corresponds to event.phone

    // or update the whole thing using IdentityMap
    var updatedPhone = IdentityMap.update(Phone, ["images"])(event.phone);

    // or update specific parts
    val updateNameAndPath = IdentityMap.update(PhoneImage, ["name", "imagePath"]);
    event.phone.images.map(function(image) {
      updateNameAndPath(image);
    });

    // or use a lens (note the nested array - this is where traverse is used)
    val updatedPhoneFirstImagePath = IdentityMap.update(Phone, [["images", 0, "imagePath"]])(event.phone);
  });
});

myAppModule.factory("myService", function(/* deps */) {
  return {
    recieve: function(messageType, callback) { /* ... some async code invoking callback */ }
  }
};

myAppModule.factory("Phone", function(/* deps */) {
  function Phone(attrs) {
    for (k in attrs) { this[k] = attrs[k] }
    // store in the map; all future calls with the same parameters will have no effect on the map
    // if you really need to replace, use IdentityMap.replace
    IdentityMap.set(this.constructor)(this);
  }

  // required by IdentityMap, otherwise an Error is thrown
  // must be something immutable and unique
  Phone.prototype.identity = function() { return this.id; };

  return Phone;
};

myAppModule.factory("PhoneImage", function(/* deps */) {
  function PhoneImage(attrs) {
    for (k in attrs) { this[k] = attrs[k] }
    IdentityMap.set(this.constructor)(this);
  }

  PhoneImage.prototype.identity = function() { return this.id; };

  return PhoneImage;
};
```

### Configuration

Nothing to configure (yet).


More examples can be found in test/spec/tests.js.


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
