describe("dbaumann.identity-map", function() {

  beforeEach(module("dbaumann.identity-map"));

  describe("IdentityMap", function() {
    
    function Widget(plainValue) {
      this.id = plainValue.id;
      this.features = plainValue.features;
    }
    Widget.prototype.wrapperMethod = function() {};
    Widget.prototype.identity = function() { return this.id; };
    
    var IdentityMap, myWidget;
    beforeEach(inject(function($injector) {
      IdentityMap = $injector.get("IdentityMap");
      myWidget = new Widget({id:1, features:null});
    }));

    it("should enable set and get by constructor,value", function() {
      IdentityMap.set(Widget)(myWidget);
      expect(IdentityMap.get(Widget)(myWidget)).toBe(myWidget);
    });

    it("should enable set and get by direct keys", function() {
      IdentityMap.set(Widget)(myWidget);
      expect(IdentityMap.get("Widget")(myWidget.id)).toBe(myWidget);
    });

    it("should set only if an item isn't already in the index or if replacing", function() {
      IdentityMap.set(Widget)(myWidget);
      expect(IdentityMap.get("Widget")(myWidget.id)).toBe(myWidget);

      var anotherWidget = new Widget({id:1, features:"will call"});

      IdentityMap.set(Widget)(anotherWidget);
      expect(IdentityMap.get("Widget")(myWidget.id)).toBe(myWidget);

      IdentityMap.replace(Widget)(anotherWidget);
      expect(IdentityMap.get("Widget")(myWidget.id)).toBe(anotherWidget);
    });

    it("should throw when attempting to get from non-existent collections", function() {
      IdentityMap.set(Widget)(myWidget);
      
      expect(function() {
        IdentityMap.get("Sprocket")(myWidget.id)
      }).toThrow();
    });

    it("should enable synchronization of an entity reference", function() {
      IdentityMap.set(Widget)(myWidget);
      var updatedValue = { id: 1, features: "jacket munchers" };

      // can't update by collection key
      expect(function() {
        IdentityMap.update("Widget", ["features"])(updatedValue)
      }).toThrow();

      expect(
        IdentityMap.update(Widget, ["features"])(updatedValue)
      ).toBe(myWidget);

      expect(myWidget.features).toBe(updatedValue.features);
    });

    it("should preserve nested entity types during synchronization", function() {
        function WidgetCollection(plainValue) {
          this.id = plainValue.id;
          this.items = [];

          that = this;
          angular.forEach(plainValue.items, function(widget) {
            that.items.push(new Widget(widget))
          });
        }
        WidgetCollection.prototype.identity = function() { return this.id; };

        var myCollection = new WidgetCollection({id: 1, items: [myWidget]});

        var indexId = myCollection.id;
        IdentityMap.set(WidgetCollection)(myCollection);
        var updatedValue = { id: 1, items: [{id: 1, features: "smootstick"}] };

        IdentityMap.update(WidgetCollection, ["items"])(updatedValue);

        var updatedItem = myCollection.items[0];
        expect(updatedItem.constructor.name).toBe("Widget");
        expect(updatedItem.wrapperMethod).toBeDefined();

        // IdentityMap.update also accepts paths
        updatedValue = { id: 1, items: [{id: 1, features: ["smootstick", "honeypot"]}] };

        IdentityMap.update(WidgetCollection, [["items", 0, "features"]])(updatedValue);
        expect(myCollection.items[0].features).toEqual(["smootstick", "honeypot"]);
    });

  });

});
